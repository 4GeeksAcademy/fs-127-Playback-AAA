
import click
from api.models import db, User
from api.models import db, Product, Review

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with youy database, for example: Import the price of bitcoin every night as 12am
"""


def setup_commands(app):
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users")  # name of our command
    @click.argument("count")  # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.password = "123456"
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    @app.cli.command("insert-test-data")
    def insert_test_data():
        pass

    @app.cli.command("insert-products")
    def insert_products():
        products = [
            Product(
                name="Television",
                price=500.00,
                stock=10,
                discount=0,
                category_id=1
            ),
            Product(
                name="Laptop",
                price=999.99,
                stock=5,
                discount=10,
                category_id=2
            ),
        ]
        db.session.add_all(products)
        db.session.commit()
        print("Productos insertados correctamente")

    @app.cli.command("insert-reviews")
    def insert_reviews():
        reviews = [
            Review(rating=5, title="Excelente", comment="Muy buena televisión",
                  product_id=2),
            Review(rating=4, title="Buena laptop", comment="Funciona muy bien",
                    product_id=2),
            Review(rating=3, title="Normal", comment="Podría ser mejor",
                  product_id=1),
        ]
        db.session.add_all(reviews)
        db.session.commit()
        print("Reviews insertadas correctamente")
