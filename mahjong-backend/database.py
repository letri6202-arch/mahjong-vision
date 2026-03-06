from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, func
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from loguru import logger
db_url = f"postgresql+psycopg2://postgres:Jewells11270?@localhost:5432/mahjong_dev"

engine = create_engine(db_url)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    try:
        with engine.connect() as connection:
            logger.success("Database connection successful")
            return True
    except Exception as e:
        logger.error("Database connection failed: {}", e)
        return False
    

if __name__ == "__main__":
    test_connection()