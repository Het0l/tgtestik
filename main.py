from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
import aiosqlite
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY") or "очень_длинный_секретный_ключ_замени_меня_1234567890abcdef"
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 дней

app = FastAPI(title="Aura Market API")

security = HTTPBearer()

# ────────────────────────────────────────────────
# Модели запросов/ответов
# ────────────────────────────────────────────────

class TelegramInitData(BaseModel):
    init_data: str          # строка initData от Telegram WebApp

class UserInfo(BaseModel):
    id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class PurchaseCreate(BaseModel):
    item_name: str
    item_id: Optional[str] = None
    price: float
    currency: str = "USD"
    trade_link: str

class PurchaseOut(BaseModel):
    id: int
    item_name: str
    price: float
    currency: str
    status: str
    created_at: str
    completed_at: Optional[str] = None

# ────────────────────────────────────────────────
# Вспомогательные функции
# ────────────────────────────────────────────────

async def get_db():
    async with aiosqlite.connect("aura_market.db") as db:
        db.row_factory = aiosqlite.Row
        yield db

async def create_tables():
    async with aiosqlite.connect("aura_market.db") as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id),
                item_name TEXT NOT NULL,
                item_id TEXT,
                price REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                status TEXT DEFAULT 'pending',
                trade_link TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME
            )
        """)
        await db.commit()

# Создаём таблицы при старте (можно вынести в миграцию позже)
import asyncio
asyncio.run(create_tables())

def create_jwt_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Токен отсутствует или неверный формат")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise HTTPException(401, "Неверный токен")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Токен истёк")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Неверный токен")

# ────────────────────────────────────────────────
# Эндпоинты
# ────────────────────────────────────────────────

@app.post("/api/auth/telegram")
async def telegram_auth(data: TelegramInitData):
    """
    Здесь должна быть настоящая проверка initData от Telegram.
    Пока просто принимаем и выдаём токен (для теста).
    В продакшене → проверка по bot_token и hash
    """
    # TODO: настоящая валидация initData
    # https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

    # Пример: парсим user из init_data (очень упрощённо!)
    # В реальности используй библиотеку python-telegram-bot или вручную проверяй hash
    try:
        # имитация парсинга (замени на реальную логику)
        user_id = 123456789      # ← здесь реальный user.id из initData
        username = "test_user"
        first_name = "Тест"
        last_name = "Тестович"
    except:
        raise HTTPException(400, "Неверные данные Telegram")

    async with aiosqlite.connect("aura_market.db") as db:
        await db.execute("""
            INSERT OR IGNORE INTO users (id, username, first_name, last_name)
            VALUES (?, ?, ?, ?)
        """, (user_id, username, first_name, last_name))
        
        await db.execute("""
            UPDATE users SET last_seen = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (user_id,))
        
        await db.commit()

    token = create_jwt_token(user_id)
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/profile")
async def get_profile(user_id: int = Depends(get_current_user)):
    async with aiosqlite.connect("aura_market.db") as db:
        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = await cursor.fetchone()
        
        if not user:
            raise HTTPException(404, "Пользователь не найден")
        
        return dict(user)


@app.post("/api/purchase")
async def create_purchase(
    purchase: PurchaseCreate,
    user_id: int = Depends(get_current_user)
):
    async with aiosqlite.connect("aura_market.db") as db:
        cursor = await db.execute("""
            INSERT INTO purchases (user_id, item_name, item_id, price, currency, trade_link, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        """, (
            user_id,
            purchase.item_name,
            purchase.item_id,
            purchase.price,
            purchase.currency,
            purchase.trade_link
        ))
        
        purchase_id = cursor.lastrowid
        await db.commit()

    return {"purchase_id": purchase_id, "status": "created"}


@app.get("/api/purchases")
async def get_my_purchases(user_id: int = Depends(get_current_user)):
    async with aiosqlite.connect("aura_market.db") as db:
        cursor = await db.execute("""
            SELECT id, item_name, price, currency, status, created_at, completed_at
            FROM purchases
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        """, (user_id,))
        
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


# Для админа / отладки (можно потом закрыть авторизацией)
@app.get("/api/admin/users")
async def get_all_users():
    async with aiosqlite.connect("aura_market.db") as db:
        cursor = await db.execute("SELECT * FROM users ORDER BY last_seen DESC")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
