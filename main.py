from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('main.html')

@app.route('/news')
def news():
    return render_template('SMI.html')

@app.route('/shop')
def shop():
    return render_template('shop.html')

@app.route('/popular')
def popular():
    return render_template('popular.html')
    
@app.route('/admin')
def admin():
    return render_template('admin.html')
# @app.route('/page1')
# def page1():
#     return render_template('page1.html')
#
# @app.route('/page2')
# def page2():
#     return render_template('page2.html')
#
# @app.route('/page3')
# def page3():
#     return render_template('page3.html')

if __name__ == '__main__':
    app.run(debug=True)
