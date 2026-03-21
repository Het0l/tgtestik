
        document.querySelectorAll('.btn-buy').forEach(button => {
            button.addEventListener('click', function() {
                const skinName = this.closest('.skin-card').querySelector('.skin-name').textContent;
                const skinPrice = this.closest('.skin-card').querySelector('.price').textContent;
                alert(`Вы добавили в корзину: ${skinName} за ${skinPrice}`);
            });
        });
        
        document.querySelector('.btn-shop').addEventListener('click', function() {
            alert('Переход в магазин...');
        });
        
        document.querySelector('.btn-register').addEventListener('click', function() {
            alert('Открытие формы регистрации...');
        });
        
        document.querySelector('.btn-login').addEventListener('click', function() {
            alert('Открытие формы входа...');
        });