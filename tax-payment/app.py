from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime

app = Flask(__name__, template_folder="templates", static_folder="static")

# SQLAlchemy Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Lebronjames22*@localhost/tax_tracking'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the Database and Migration
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Define the TaxPayment Model
class TaxPayment(db.Model):
    __tablename__ = 'tax_payments'

    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(10), nullable=False)
    due_date = db.Column(db.Date, nullable=False)

    def __init__(self, company, amount, payment_date, status, due_date):
        self.company = company
        self.amount = amount
        self.payment_date = payment_date
        self.status = status
        self.due_date = due_date


# Home Page: Show All Records
@app.route('/')
def index():
    records = TaxPayment.query.all()
    return render_template('index.html', records=records)

# Insert Data
@app.route('/insert', methods=['POST'])
def insert():
    data = request.form
    payment_date = data['payment_date'] if data['payment_date'] else None

    new_record = TaxPayment(
        company=data['company'],
        amount=float(data['amount']),
        payment_date=datetime.strptime(payment_date, '%Y-%m-%d') if payment_date else None,
        status=data['status'],
        due_date=datetime.strptime(data['due_date'], '%Y-%m-%d')
    )
    db.session.add(new_record)
    db.session.commit()
    return redirect(url_for('index'))

# Delete Record
@app.route('/delete/<int:id>', methods=['POST'])
def delete(id):
    record = TaxPayment.query.get_or_404(id)
    db.session.delete(record)
    db.session.commit()
    return redirect(url_for('index'))

# API to Fetch Filtered Results
@app.route('/filter', methods=['GET'])
def filter_data():
    due_date = request.args.get('due_date')
    filtered_records = TaxPayment.query.filter_by(due_date=due_date).all()
    results = [{
        'id': record.id,
        'company': record.company,
        'amount': record.amount,
        'payment_date': str(record.payment_date),
        'status': record.status,
        'due_date': str(record.due_date)
    } for record in filtered_records]
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)
