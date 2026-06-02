from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class CrêpeItem(db.Model):
    __tablename__ = 'crepe_items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)          # اسم الكريب (مثلا: كرانشي سوبريم)
    description = db.Column(db.String(255), nullable=True)     # المكونات (فراخ كرانشي، موتزاريلا، صوص...)
    price = db.Column(db.Float, nullable=False)                # السعر
    category = db.Column(db.String(50), nullable=False)         # حادق (فراخ)، حادق (لحوم)، حلو
    image_file = db.Column(db.String(100), nullable=False, default='default_crepe.jpg') # اسم ملف الصورة

    def __repr__(self):
        return f"<CrêpeItem {self.name} - {self.price} EGP>"

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)  # اسم الزبون
    customer_phone = db.Column(db.String(20), nullable=False)  # رقم التليفون لتأكيد الأوردر
    customer_address = db.Column(db.Text, nullable=False)      # العنوان بالتفصيل (المنطقة، الشارع، الدور)
    
    # هنخزن محتويات الأوردر كـ Text بصيغة JSON أو نص منسق (مثال: "2 كريب زنجر، 1 كريب نوتيلا")
    order_details = db.Column(db.Text, nullable=False) 
    
    total_price = db.Column(db.Float, nullable=False)          # الحساب الإجمالي شامل الدليفري
    order_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # حالة الأورder: 'Pending' (قيد الانتظار)، 'Preparing' (بيتجهز في المطبخ)، 'Out for Delivery' (مع الطيار)، 'Delivered' (تم التوصيل)
    status = db.Column(db.String(50), nullable=False, default='Pending')

    def __repr__(self):
        return f"<Order #{self.id} - {self.customer_name} - {self.status}>"