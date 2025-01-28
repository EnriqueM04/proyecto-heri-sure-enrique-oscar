import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')

    # Change the values ​​here according to your MySQL credentials
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',                                      # Can be overridden by an environment variable
        'mysql+pymysql://root:@localhost:3308/sensores_iot'  # Replace 'password' if necessary
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

