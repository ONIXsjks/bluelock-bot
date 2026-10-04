import telebot
from telebot import types
import os
from flask import Flask, send_from_directory
import threading

BOT_TOKEN = os.environ.get('BOT_TOKEN')
RAILWAY_URL = os.environ.get('RAILWAY_URL', 'https://your-app.up.railway.app')

bot = telebot.TeleBot(BOT_TOKEN)
app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@bot.message_handler(commands=['start'])
def start(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    btn = types.KeyboardButton("⚽ ورود به بلو لاک", web_app=types.WebAppInfo(url=RAILWAY_URL))
    markup.add(btn)
    bot.send_message(message.chat.id, "برای بازی روی دکمه زیر بزن:", reply_markup=markup)

def run_bot():
    bot.polling()

if __name__ == '__main__':
    threading.Thread(target=run_bot, daemon=True).start()
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
