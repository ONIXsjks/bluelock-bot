import telebot
from telebot import types
import random
import os

BOT_TOKEN = os.environ.get('BOT_TOKEN')
bot = telebot.TeleBot(BOT_TOKEN)

users = {}

# ===== ۸ کاراکتر =====
CHARS = {
    'isagi':   {'name': '⚽ ایساگی',  'team': 'BL', 'weapon': 'Metavision',      'power': 70, 'speed': 75, 'tech': 78, 'vision': 95, 'bonus': 0.15, 'quote': 'من بهترین مهاجم جهان می‌شم!'},
    'bachira': {'name': '🎩 باچیرا',  'team': 'BL', 'weapon': 'Instinct Dribble','power': 72, 'speed': 82, 'tech': 88, 'vision': 75, 'bonus': 0.14, 'quote': 'هیولا توی من بیدار شده!'},
    'chigiri': {'name': '⚡ چیگیری',  'team': 'BL', 'weapon': 'Speed Burst',     'power': 68, 'speed': 99, 'tech': 80, 'vision': 70, 'bonus': 0.13, 'quote': 'من دیگه نمی‌ترسم!'},
    'nagi':    {'name': '🕹️ ناگی',    'team': 'BL', 'weapon': 'Ball Control',    'power': 75, 'speed': 72, 'tech': 95, 'vision': 80, 'bonus': 0.16, 'quote': 'خیلی دردسره...'},
    'rin':     {'name': '🧊 رین',      'team': 'NE', 'weapon': 'Puppet Control',  'power': 82, 'speed': 85, 'tech': 90, 'vision': 88, 'bonus': 0.20, 'quote': 'من برادرم رو نابود می‌کنم!'},
    'shidou':  {'name': '👊 شیدو',    'team': 'NE', 'weapon': 'Wild Shot',       'power': 90, 'speed': 88, 'tech': 85, 'vision': 65, 'bonus': 0.19, 'quote': 'فوتبال یعنی زندگی!'},
    'reo':     {'name': '🦎 رئو',     'team': 'NE', 'weapon': 'Chameleon Copy',  'power': 78, 'speed': 80, 'tech': 82, 'vision': 85, 'bonus': 0.15, 'quote': 'من همه چیز رو کپی می‌کنم!'},
    'sae':     {'name': '🌟 سائه',     'team': 'NE', 'weapon': 'World Class Pass','power': 75, 'speed': 78, 'tech': 92, 'vision': 99, 'bonus': 0.22, 'quote': 'فوتبال ژاپن مرده!'},
}

@bot.message_handler(commands=['start'])
def start(message):
    uid = message.from_user.id
    if uid not in users:
        users[uid] = {'name': message.from_user.first_name, 'char': None}
        markup = types.InlineKeyboardMarkup(row_width=2)
        btns = [types.InlineKeyboardButton(CHARS[k]['name'], callback_data=f'pick_{k}') for k in CHARS]
        markup.add(*btns)
        bot.send_message(uid, f"سلام {message.from_user.first_name}! ⚽\n\nکاراکترت رو انتخاب کن:", reply_markup=markup)
    else:
        bot.send_message(uid, "قبلاً ثبت‌نام کردی! /menu رو بزن.")

@bot.callback_query_handler(func=lambda call: call.data.startswith('pick_'))
def pick_char(call):
    uid = call.from_user.id
    key = call.data.split('_')[1]
    if uid in users and key in CHARS:
        users[uid]['char'] = key
        c = CHARS[key]
        team_fa = "🔵 Blue Lock XI" if c['team'] == 'BL' else "🔴 Neo Egoist"
        bot.answer_callback_query(call.id, "انتخاب شد!")
        text = (
            f"✅ کاراکتر تو: {c['name']}\n"
            f"🏟️ تیم: {team_fa}\n"
            f"🗡️ سلاح: {c['weapon']}\n\n"
            f"💬 \"{c['quote']}\"\n\n"
            f"📊 قدرت: {c['power']} | سرعت: {c['speed']}\n"
            f"🎯 تکنیک: {c['tech']} | دید: {c['vision']}\n"
            f"🔥 بونوس: +{int(c['bonus']*100)}%\n\n"
            f"از /menu استفاده کن."
        )
        bot.edit_message_text(text, uid, call.message.message_id)

@bot.message_handler(commands=['menu'])
def menu(message):
    uid = message.from_user.id
    if uid not in users or not users[uid]['char']:
        bot.reply_to(message, "اول /start رو بزن!"); return
    markup = types.InlineKeyboardMarkup(row_width=1)
    markup.add(
        types.InlineKeyboardButton("⚔️ بازی ۱v۱ (با ربات)", callback_data='play_1v1'),
        types.InlineKeyboardButton("⚽ بازی ۲v۲ (با ربات)", callback_data='play_2v2'),
        types.InlineKeyboardButton("📊 کارت بازیکن من", callback_data='my_card'),
        types.InlineKeyboardButton("🔄 تغییر کاراکتر", callback_data='change_char'),
    )
    bot.send_message(uid, "🏟️ منوی بلو لاک:", reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data == 'my_card')
def my_card(call):
    uid = call.from_user.id
    if uid not in users or not users[uid]['char']: return
    c = CHARS[users[uid]['char']]
    team_fa = "🔵 Blue Lock XI" if c['team'] == 'BL' else "🔴 Neo Egoist"
    bot.answer_callback_query(call.id)
    bot.send_message(uid,
        f"╔══════════════════╗\n"
        f"   {c['name']}\n"
        f"╠══════════════════╣\n"
        f"  🏟️ {team_fa}\n"
        f"  🗡️ {c['weapon']}\n"
        f"  📊 قدرت: {c['power']}\n"
        f"  ⚡ سرعت: {c['speed']}\n"
        f"  🎯 تکنیک: {c['tech']}\n"
        f"  👁️ دید: {c['vision']}\n"
        f"  🔥 بونوس: +{int(c['bonus']*100)}%\n"
        f"╚══════════════════╝\n\n"
        f"💬 \"{c['quote']}\"")

@bot.callback_query_handler(func=lambda call: call.data == 'change_char')
def change_char(call):
    uid = call.from_user.id
    bot.answer_callback_query(call.id)
    markup = types.InlineKeyboardMarkup(row_width=2)
    btns = [types.InlineKeyboardButton(CHARS[k]['name'], callback_data=f'pick_{k}') for k in CHARS]
    markup.add(*btns)
    bot.edit_message_text("کاراکتر جدیدت رو انتخاب کن:", uid, call.message.message_id, reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data == 'play_1v1')
def play_1v1(call):
    uid = call.from_user.id
    if uid not in users or not users[uid]['char']: return
    my_char = users[uid]['char']
    my_team = CHARS[my_char]['team']
    enemies = [k for k, v in CHARS.items() if v['team'] != my_team]
    enemy = random.choice(enemies)
    result = simulate(my_char, enemy)
    bot.answer_callback_query(call.id)
    bot.send_message(uid, result)
    menu(call.message)

@bot.callback_query_handler(func=lambda call: call.data == 'play_2v2')
def play_2v2(call):
    uid = call.from_user.id
    if uid not in users or not users[uid]['char']: return
    my_char = users[uid]['char']
    my_team = CHARS[my_char]['team']
    my_allies = [k for k, v in CHARS.items() if v['team'] == my_team and k != my_char]
    enemies = [k for k, v in CHARS.items() if v['team'] != my_team]
    if len(my_allies) < 1 or len(enemies) < 2:
        bot.answer_callback_query(call.id, "کاراکتر کافی نیست!")
        return
    ally = random.choice(my_allies)
    e1, e2 = random.sample(enemies, 2)
    result = simulate_2v2(my_char, ally, e1, e2)
    bot.answer_callback_query(call.id)
    bot.send_message(uid, result)
    menu(call.message)

def simulate(my_char, enemy_char):
    me = CHARS[my_char]
    en = CHARS[enemy_char]
    my_power = me['bonus'] + (me['power'] + me['tech'] + me['vision']) / 500
    en_power = en['bonus'] + (en['power'] + en['tech'] + en['vision']) / 500
    total = my_power + en_power
    my_chance = my_power / total if total > 0 else 0.5
    win = random.random() < my_chance
    my_goals = random.randint(1, 4) if win else random.randint(0, 2)
    en_goals = random.randint(0, my_goals - 1) if win else random.randint(my_goals + 1, my_goals + 3)
    
    text = f"⚔️ **مسابقه ۱v۱**\n\n"
    text += f"🟦 {me['name']}  vs  {en['name']} 🟥\n\n"
    text += f"⏱️ نیمه اول:\n"
    text += f"  دقیقه {random.randint(5,20)}: {me['name']} حمله می‌کنه...\n"
    text += f"  دقیقه {random.randint(25,45)}: {en['name']} شوت می‌زنه...\n\n"
    text += f"⏱️ نیمه دوم:\n"
    text += f"  دقیقه {random.randint(50,70)}: {me['name']} دریبل می‌زنه...\n"
    text += f"  دقیقه {random.randint(75,90)}: {en['name']} ضدحمله...\n\n"
    text += f"🎯 **نتیجه نهایی:**\n"
    text += f"{me['name']}  {my_goals} - {en_goals}  {en['name']}\n\n"
    
    if win:
        text += f"🎉 **بردی!**\n💬 \"{me['quote']}\""
    else:
        text += f"😔 **باختی...**\n💬 \"{en['quote']}\""
    return text

def simulate_2v2(my_char, ally_char, e1_char, e2_char):
    me = CHARS[my_char]
    ally = CHARS[ally_char]
    e1 = CHARS[e1_char]
    e2 = CHARS[e2_char]
    
    my_power = me['bonus'] + ally['bonus'] + (me['power'] + ally['power'] + me['tech'] + ally['tech']) / 500
    en_power = e1['bonus'] + e2['bonus'] + (e1['power'] + e2['power'] + e1['tech'] + e2['tech']) / 500
    
    if my_char == 'sae' or ally_char == 'sae':
        my_power *= 1.1
    if e1_char == 'sae' or e2_char == 'sae':
        en_power *= 1.1
    
    total = my_power + en_power
    my_chance = my_power / total if total > 0 else 0.5
    win = random.random() < my_chance
    my_goals = random.randint(1, 5) if win else random.randint(0, 2)
    en_goals = random.randint(0, my_goals - 1) if win else random.randint(my_goals + 1, my_goals + 4)
    
    text = f"⚽ **مسابقه ۲v۲**\n\n"
    text += f"🟦 {me['name']} + {ally['name']}\n"
    text += f"   vs\n"
    text += f"🟥 {e1['name']} + {e2['name']}\n\n"
    text += f"⏱️ بازی شروع شد!\n"
    text += f"  دقیقه {random.randint(10,30)}: {me['name']} پاس می‌ده به {ally['name']}...\n"
    text += f"  دقیقه {random.randint(40,60)}: {e1['name']} حمله می‌کنه...\n"
    text += f"  دقیقه {random.randint(70,88)}: {e2['name']} شوت می‌زنه...\n\n"
    text += f"🎯 **نتیجه:**\n"
    text += f"🟦 تیم تو: {my_goals}\n"
    text += f"🟥 تیم حریف: {en_goals}\n\n"
    
    if win:
        text += f"🎉 **تیمت برد!**\n💬 \"{me['quote']}\""
    else:
        text += f"😔 **تیمت باخت...**\n💬 \"{e1['quote']}\""
    return text

print("🤖 بات روشن شد...")
bot.polling()