import asyncio
from playwright.async_api import async_playwright
from pymongo import MongoClient
import jwt
from pymongo import MongoClient
import sys
from Crypto.Cipher import AES
import base64
import hashlib
from dotenv import load_dotenv
load_dotenv()
import os



JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_key")  # Must match JwtStrategy
JWT_ALGORITHM = "HS256"


def decrypt(encrypted_text, secret):
    try:
        iv_hex, encrypted_hex = encrypted_text.split(":")
        iv = bytes.fromhex(iv_hex)
        encrypted_data = bytes.fromhex(encrypted_hex)
        key = hashlib.sha256(secret.encode()).digest()
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted = cipher.decrypt(encrypted_data)
        pad = decrypted[-1]
        return decrypted[:-pad].decode('utf-8')
    except Exception as e:
        print(f"❌ Failed to decrypt: {e}")
        return None


    

try:
    token = sys.argv[1]  # Token passed as first argument
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    CURRENT_ORGANIZATION_ID = payload.get("organizationID")
    if not CURRENT_ORGANIZATION_ID:
        raise ValueError("organizationID not found in token")
except Exception as e:
    print(f"❌ Failed to decode token or extract organizationID: {e}")
    sys.exit(1)


GREEN_CHECK = "\033[92m✔\033[0m"  # Зеленый символ для уведомления
RED_CROSS = "\033[91m✖\033[0m"    # Красный символ для уведомления

# MongoDB connection parameters
JWT_ALGORITHM = "HS256"
MONGO_URI = "mongodb://localhost:27017"  # MongoDB server URL
DB_NAME = "auth"  # Database name
COLLECTION_PRODUCTS = "products"              # Collection name (table equivalent)
COLLECTION_ORGANIZATIONS = "organizations"


def connect_db():
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection_prod = db[COLLECTION_PRODUCTS]
        return collection_prod
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

def connect_db_organization():
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection_orgs = db[COLLECTION_ORGANIZATIONS]
        return collection_orgs
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None


async def block_unnecessary_resources(page):
    await page.route("**/*", lambda route: (
        route.abort() if route.request.resource_type in ['stylesheet', 'image', 'font'] else route.continue_()
    ))


def get_user_tarif():
    collection_orgs = connect_db_organization()
    if collection_orgs is not None: 
        organization = collection_orgs.find_one({
            "organizationID": CURRENT_ORGANIZATION_ID
        })
        if organization and "isPaid" in organization:
            return str(organization["isPaid"])
        else: 
            print(f"the isPaid is not found in the organization: {CURRENT_ORGANIZATION_ID}")
            return None
    else: 
        print(f" can not connect to the collection organizations")
        return None
    
def get_product_count_and_capacity():
    collection_prod = connect_db()
    collection_orgs = connect_db_organization()
    
    if collection_prod is not None and collection_orgs is not None:
        product_count = collection_prod.count_documents({
            "organizationID": CURRENT_ORGANIZATION_ID
        })
        
        org = collection_orgs.find_one({
            "organizationID": CURRENT_ORGANIZATION_ID
        })

        if org and "capacity" in org:
            return product_count, int(org["capacity"])
        else:
            print("⚠ Не найдено поле capacity для организации.")
            return product_count, 0
    else:
        print("❌ Не удалось подключиться к коллекциям.")
        return 0, 0

def get_isOnDemo():
    collection_orgs = connect_db_organization()
    if collection_orgs is not None: 
        organization = collection_orgs.find_one({
            "organizationID": CURRENT_ORGANIZATION_ID
        })

        if organization and "isOnDemo" in organization:
            return str(organization["isOnDemo"])
        else:
            print(f"the isOnDemo is not found for the org: {CURRENT_ORGANIZATION_ID}")
            
    else: 
        print(f"cannot connect to the collection organizathanions")
        return None

def get_isOn():
    collection_orgs = connect_db_organization()
    if collection_orgs is not None:
        organization = collection_orgs.find_one({
            "organizationID": CURRENT_ORGANIZATION_ID
        })

        if not "isOn" in organization:
            isOn = "off"
            return isOn

        if organization and "isOn" in organization:
            return str(organization["isOn"])
        else:
            print(f"the isOn is not found for the org: {CURRENT_ORGANIZATION_ID}")
            
    else: 
        print(f"cannot connect to the collection organizathanions")
        return None

def get_minPriceGlob():
    collection_orgs = connect_db_organization()
    if collection_orgs is not None:
        organization = collection_orgs.find_one({
            "organizationID": CURRENT_ORGANIZATION_ID
        })

        if not "minPriceGlob" in organization:
            minPriceGlob = 10
            return minPriceGlob

        if organization and "minPriceGlob" in organization:
            return str(organization["minPriceGlob"])
        else:
            print(f"the minPriceGlob is not found for the org: {CURRENT_ORGANIZATION_ID}")
            
    else: 
        print(f"cannot connect to the collection organizathanions")
        return None
    
def get_maxPriceGlob():
    collection_orgs = connect_db_organization()
    if collection_orgs is not None:
        organization = collection_orgs.find_one({
            "organizationID": CURRENT_ORGANIZATION_ID
        })

        if not "maxPriceGlob" in organization:
            maxPriceGlob = 10
            return maxPriceGlob

        if organization and "maxPriceGlob" in organization:
            return str(organization["maxPriceGlob"])
        else:
            print(f"the maxPriceGlob is not found for the org: {CURRENT_ORGANIZATION_ID}")
            
    else: 
        print(f"cannot connect to the collection organizathanions")
        return None
    
def get_stepGlob():
    collection_orgs = connect_db_organization()
    if collection_orgs is not None:
        organization = collection_orgs.find_one({
            "organizationID": CURRENT_ORGANIZATION_ID
        })

        if not "stepGlob" in organization:
            stepGlob = 1
            return stepGlob

        if organization and "stepGlob" in organization:
            return str(organization["stepGlob"])
        else:
            print(f"the stepGlob is not found for the org: {CURRENT_ORGANIZATION_ID}")
            
    else: 
        print(f"cannot connect to the collection organizathanions")
        return None

def get_decrease_from_db(product_sku):
    collection_prod = connect_db()
    if     collection_prod is not None:
        product =      collection_prod.find_one({
            "sku": product_sku,
            "organizationID": CURRENT_ORGANIZATION_ID
        })
        if product and "decrease" in product:
            return str(product["decrease"])
        else: 
            print(f"Не найден decrease для артикулa: {product_sku} в организации: {CURRENT_ORGANIZATION_ID}") 
            return None
  
def get_increase_from_db(product_sku):
    collection_prod = connect_db()
    if collection_prod is not None:
        product = collection_prod.find_one({
            "sku": product_sku,
            "organizationID": CURRENT_ORGANIZATION_ID
        })
        if product and "increase" in product:
            return str(product["increase"])
        else:
            print(f"the decrease was not found for the: {product_sku} in org: {CURRENT_ORGANIZATION_ID}")
            return None

def get_min_price_from_db(product_sku):
    collection_prod = connect_db()
    if     collection_prod is not None:
        product =      collection_prod.find_one({
            "sku": product_sku,
            "organizationID": CURRENT_ORGANIZATION_ID
        })
        if product and "min_price" in product:
            return float(product["min_price"])
        else:
            print(f"Не найден min_price для артикулa: {product_sku} в организации: {CURRENT_ORGANIZATION_ID}")
            return None
    else:
        print("Ошибка при подключении к базе данных.")
        return None

def get_max_price_from_db(product_sku):
    collection_prod = connect_db()
    if collection_prod is not None:
        product = collection_prod.find_one({
            "sku": product_sku,
            "organizationID": CURRENT_ORGANIZATION_ID
        })
        if product and "max_price" in product:
            return float(product["max_price"])
        else:
            print(f" the max_price was not found for the product: {product_sku} in org: {CURRENT_ORGANIZATION_ID} ")
            return None

def get_step_from_db(product_sku):
    collection_prod = connect_db()
    if     collection_prod is not None:
        product =      collection_prod.find_one({
            "sku": product_sku,
            "organizationID": CURRENT_ORGANIZATION_ID
        })
        if product and "step" in product:
            return float(product["step"])
        else:
            print(f"Не найден step для артикулa: {product_sku} в организации: {CURRENT_ORGANIZATION_ID}")
            return None
    else:
        print("Ошибка при подключении к базе данных.")
        return None


def get_cur_price_from_db(product_sku):
    collection_prod = connect_db()
    if     collection_prod is not None:
        product =      collection_prod.find_one({
            "sku": product_sku,
            "organizationID": CURRENT_ORGANIZATION_ID
        })
        if product and "current_price" in product:
            return float(product["current_price"])
        else:
            print(f"Не найден current_price для артикулa: {product_sku} в организации: {CURRENT_ORGANIZATION_ID}")
            return None
    else:
        print("Ошибка при подключении к базе данных.")
        return None

collection_orgs = connect_db_organization()
organization = collection_orgs.find_one({"organizationID": CURRENT_ORGANIZATION_ID})

# ✅ These replace the hardcoded values
login_email = organization.get("kaspiLoginEmail")
encrypted_pw = organization.get("kaspiPasswordEncrypted")
print("📥 EMAIL FROM DB:", login_email)
print("📥 ENCRYPTED PW FROM DB:", encrypted_pw)


password = decrypt(encrypted_pw, JWT_SECRET)
print("🔓 Decrypted password:", password)


if not login_email or not password:
    print("❌ Kaspi login credentials missing or invalid. Bot will not continue.")
    sys.exit(1)


async def login(page):
    # await block_unnecessary_resources(page)

    await page.goto('https://kaspi.kz/mc/#/login')
    await page.wait_for_load_state('networkidle')
    await asyncio.sleep(1)

    await page.click('input#user_email_field')
    await page.fill('input#user_email_field', login_email)
    await asyncio.sleep(0)

    await page.click('button.button.is-primary')
    await page.wait_for_selector('input#password_field', timeout=10000)
    await page.fill('input#password_field', password)
    await asyncio.sleep(0)
    
    await page.click('button.button.is-primary')
    await page.wait_for_load_state('networkidle')
    await asyncio.sleep(0)

    # Переход на страницу активных товаров после логина
    await page.goto('https://kaspi.kz/mc/#/products/active/1')
    await page.wait_for_load_state('networkidle')
    await asyncio.sleep(0)


async def get_product_url_and_sku(page, product_name):
    try:
        print(f"Ищем продукт с именем: {product_name}")
        await page.click(f"//a[contains(text(), '{product_name}')]")
        await page.wait_for_load_state('networkidle')
        await asyncio.sleep(0.5)

        # Извлечение URL товара
        locator = page.locator(
            '#app > section > div.main-content > div > div.master-product__content > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div.product-info-field-value > div:nth-child(2) > a'
        )
        product_url = await locator.get_attribute('href') if await locator.count() > 0 else None

        # Извлечение артикула товара
        sku_locator = page.locator(
            '#app > section > div.main-content > div > div.master-product__content > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(2) > div.product-info-field-value'
        )
        product_sku = await sku_locator.inner_text() if await sku_locator.count() > 0 else None

        # Извлечение ссылки на изображение
        image_locator = page.locator(
            '#app > section > div.main-content > div > div.master-product__content > div.master-product-images > div > div.image-list__main-image-container > div.thumbnail-container > img'
        )
        product_image_url = await image_locator.get_attribute('src') if await image_locator.count() > 0 else None

        if product_url:
            print(f"Найден URL для товара '{product_name}': {product_url}")
        else:
            print(f"Не удалось найти URL для товара: {product_name}")

        if product_sku:
            print(f"Артикул товара '{product_name}': {product_sku}")
        else:
            print(f"Не удалось найти артикул для товара: {product_name}")

        return product_url, product_sku, product_image_url

    except Exception as e:
        print(f"Ошибка при получении URL, артикула и изображения для товара '{product_name}': {e}")
        return None, None, None

async def analyze_and_update_price(page, product_name, product_url, current_price, product_sku):
    #increase = get_increase_from_db(product_sku)
    
    try:
        full_url = f"https://kaspi.kz{product_url}"
        await page.goto(full_url)
        await page.wait_for_load_state('networkidle')
        await asyncio.sleep(0)

        # Получаем текущую цену товара на странице
        price_selector = '#ItemView > div.item > div > div.item__inner-right > div > div:nth-child(1) > div.item__price > div.item__price-left-side > div.item__price-once'
        competitor_price_element = await page.query_selector(price_selector)
        competitor_price_text = await competitor_price_element.inner_text()
        competitor_price = float(competitor_price_text.replace('₸', '').replace(' ', '').replace('&nbsp', '').replace(';', '').strip())

        print(f"Текущая цена: {current_price} ₸, Цена на странице товара: {competitor_price} ₸")

        if competitor_price < current_price:
            print(f"{GREEN_CHECK} Цена товара ниже текущей, обновляем цену.")
            # Here you can add the logic for adjusting the price
            await adjust_price(page, product_name, competitor_price, product_sku)
        else:
            if competitor_price > current_price:
                print(f"the competitor price is higher that the current price")
                await adjust_price(page, product_name, competitor_price, product_sku)
            print(f"{GREEN_CHECK} Изменение цены не требуется.")
        
        return competitor_price

    except Exception as e:
        print(f"Ошибка при анализе и изменении цены для товара '{product_name}': {e}")
        return None


async def adjust_price(page, product_name, competitor_price, product_sku):
    

    try:
        min_price = get_min_price_from_db(product_sku)
        max_price = get_max_price_from_db(product_sku)
        step = get_step_from_db(product_sku)
        decrease = get_decrease_from_db(product_sku)
        increase = get_increase_from_db(product_sku)
        current_price = get_cur_price_from_db(product_sku)

        new_price = current_price  # Start from current

        if decrease == "on" and competitor_price < current_price:
            print(f"[DECREASE] Competitor price ({competitor_price}) is lower than current ({current_price}).")
            new_price = competitor_price - step
            if min_price is not None and new_price < min_price:
                new_price = min_price
                print(f"[DECREASE] Adjusted to min_price: {new_price}")

        elif increase == "on" and competitor_price > current_price:
            print(f"[INCREASE] Competitor price ({competitor_price}) is higher than current ({current_price}).")
            new_price = competitor_price - step
            if max_price is not None and new_price > max_price:
                new_price = max_price
                print(f"[INCREASE] Adjusted to max_price: {new_price}")

        else:
            print(f"[SKIP] No price change needed for '{product_name}'.")
            return  # Exit early if no price adjustment is required

        if new_price == current_price:
            print(f"[SKIP] New price is same as current, skipping update.")
            return
        
        # Update price on Kaspi website
        offer_update_url = f'https://kaspi.kz/mc/#/offer/{product_sku}'
        await page.goto(offer_update_url)
        print(f"Перехожу на страницу изменения товара: {offer_update_url}")
        await page.wait_for_load_state('networkidle')
        await asyncio.sleep(0)

        await page.reload()
        await page.wait_for_load_state('networkidle')
        await asyncio.sleep(0)

        price_change_selector = '#app > section > div.main-content > div > div.master-product__content > div:nth-child(3) > div:nth-child(2) > div > button > span'
        price_change_input = await page.wait_for_selector(price_change_selector, timeout=10000)

        await price_change_input.click()
        price_input_selector = '#app > section > div.main-content > div > div.offer-price-edit-analytics-context > div > div.animation-content.modal-content > div > section > div > div > div:nth-child(1) > input'
        price_input = await page.wait_for_selector(price_input_selector, timeout=1000)
        await price_input.click()
        await page.keyboard.press("Control+A")
        await page.keyboard.press("Backspace")
        print(f"Поле для ввода цены очищено.")
        await asyncio.sleep(0)

        formatted_price = str(int(new_price))
        print(f"Вводим новую цену: {formatted_price} ₸")
        await price_input.type(formatted_price)
        await asyncio.sleep(0)

        save_button_selector = 'button.button.is-primary span:has-text("Сохранить")'
        await page.wait_for_selector(save_button_selector, timeout=10000)
        await page.click(save_button_selector)
        print(f"Нажата кнопка 'Сохранить' для товара '{product_name}' с новой ценой.")
        await page.wait_for_load_state('networkidle')
        await asyncio.sleep(0)

        print(f'Цена для товара {product_name} обновлена до {new_price} ₸ на сайте.')

        # ✅ Now update price in MongoDB
        collection_prod = connect_db()
        if     collection_prod is not None:
            update_result =    collection_prod.update_one(
                {
                    "product_name": product_name,
                    "organizationID": CURRENT_ORGANIZATION_ID
                },
                {
                    "$set": {
                        "current_price": new_price
                    }
                }
            )
            if update_result.modified_count > 0:
                print(f"Цена для товара '{product_name}' обновлена в базе данных MongoDB до {new_price} ₸")
            else:
                print(f"Не удалось обновить цену в базе данных MongoDB для товара '{product_name}'")
        else:
            print(f"Действие не выполнено для товара '{product_name}', потому что decrease установлен в 'off' or the increase is set to 'off'.")
        

    except Exception as e:
        print(f"Ошибка при обновлении цены для товара '{product_name}': {e}")


async def write_and_save_to_db(data):
    product_name = data[0]  # Название товара
    minGlob = get_minPriceGlob()
    maxGlob = get_maxPriceGlob()
    stepGlob = get_stepGlob()

    if not minGlob:
        minGlob = 10  # Default 10% if not found
    else:
        minGlob = int(minGlob)

    if not maxGlob:
        maxGlob = 10  # Default 10% if not found
    else:
        maxGlob = int(maxGlob)

    if not stepGlob:
        stepGlob = 1  # Default step if not found
    else:
        stepGlob = int(stepGlob)

    collection_prod = connect_db()
    if collection_prod is not None:
        existing_product = collection_prod.find_one({
            "product_name": product_name,
            "organizationID": CURRENT_ORGANIZATION_ID
        })

        if existing_product:
            # Update existing product
            collection_prod.update_one(
                {"product_name": product_name, "organizationID": CURRENT_ORGANIZATION_ID},
                {"$set": {
                    "url": data[1],
                    "current_price": data[2],
                    "price_on_page": data[3],
                    "sku": data[4],
                    "image_url": data[5]
                }}
            )
            print(f"Товар '{product_name}' найден, данные обновлены.")
        else:
            # New product: check capacity first
            count, capacity = get_product_count_and_capacity()
            if count >= capacity:
                print(f"⚠ Организация превысила лимит в {capacity} товаров. Пропускаем товар: '{product_name}'")
                return
            new_product = {
                "organizationID": CURRENT_ORGANIZATION_ID,
                "product_name": data[0],
                "url": data[1],
                "current_price": data[2],
                "price_on_page": data[3],
                "sku": data[4],
                "image_url": data[5],
                "decrease": "off",
                "increase": "off",
                "min_price": round(int(data[2]) * (1 - minGlob / 100)),
                "max_price": round(int(data[2]) * (1 + maxGlob / 100)),
                "step": stepGlob,
            }
            collection_prod.insert_one(new_product)
            print(f"✅ Добавлен новый товар '{product_name}'.")


async def get_all_product_info(page, playwright):
    while True:
        isOn = get_isOn()
        is_paid = get_user_tarif()
        isOnDemo = get_isOnDemo()

        if isOn != "on" or (is_paid != "true" and isOnDemo != "on"):
            print("⛔ Bot is turned off remotely or access denied. Exiting.")
            break

        print("🔁 Начинаем новый цикл сканирования всех товаров...")
        await page.goto(f'https://kaspi.kz/mc/#/products/active/1')
        current_page = 1
        new_instance_started = False 

        while True:
            await page.goto(f'https://kaspi.kz/mc/#/products/active/{current_page}')
            await page.wait_for_load_state('networkidle')
            await asyncio.sleep(0.5)

            # 👇 Test condition: spawn new bot after page 1
            if current_page == 10 and not new_instance_started:
                new_instance_started = True
                print("🚀 Запускаем новый экземпляр бота (тестовая логика после 1 страницы)...")
                asyncio.create_task(process_products(playwright))

            current_page_products = await page.evaluate('''() => {
                return Array.from(document.querySelectorAll('tr')).map(row => {
                    const productNameElement = row.querySelector('td[data-label="Товар"] p.is-5 a');
                    const productName = productNameElement ? productNameElement.innerText.trim() : null;
                    const productPriceElement = row.querySelector('td[data-label="Цена, тенге"] p.subtitle.is-5');
                    const productPrice = productPriceElement ? parseFloat(productPriceElement.innerText.replace('₸', '').replace(' ', '').replace(' ', '').trim()) : null;
                    if (productName && productPrice !== null) {
                        return { productName, productPrice };
                    } else {
                        return null;
                    }
                }).filter(product => product !== null);
            }''')

            if not current_page_products:
                print("❌ На текущей странице нет товаров.")
                break

            for product in current_page_products:
                try:
                    product_url, product_sku, product_image_url = await get_product_url_and_sku(page, product['productName'])
                    if product_url:
                        competitor_price = await analyze_and_update_price(page, product['productName'], product_url, product['productPrice'], product_sku)
                        if competitor_price is not None:
                            data = [product['productName'], f"https://kaspi.kz{product_url}", product['productPrice'], competitor_price, product_sku, product_image_url]
                            print(f"Записываем данные в базу данных: {data}")
                            await write_and_save_to_db(data)

                            await page.goto(f'https://kaspi.kz/mc/#/products/active/{current_page}')
                            await page.wait_for_load_state('networkidle')
                            await asyncio.sleep(0.5)
                    else:
                        print(f"⚠️ Не удалось получить URL для товара: {product['productName']}")
                except Exception as e:
                    print(f"❌ Ошибка при обработке товара '{product['productName']}': {e}")


            # ✅ Don't reload the same page again during loop
            next_button = await page.query_selector('a.pagination-link.pagination-next')

            # Make sure it's not disabled
            if next_button:
                is_disabled = await next_button.get_attribute('disabled')
                if is_disabled:
                    print("✅ Все страницы обработаны. Ждем перед новым циклом...")
                    break  # End the pagination loop
                else:
                    current_page += 1
                    await next_button.click()
                    await page.wait_for_load_state('networkidle')
                    await asyncio.sleep(1)
            else:
                print("⚠️ Кнопка 'Следующая' не найдена. Завершаем цикл.")
                break


async def process_products(playwright):
    print("Логинимся на сайт Kaspi.kz...")
    browser = await playwright.chromium.launch(headless=True)
    page = await browser.new_page()


    await login(page)

    print("Переход на страницу активных товаров...")
    await get_all_product_info(page, playwright)

    await browser.close()


async def main():
    is_paid = get_user_tarif()
    isOn = get_isOn()
    isOnDemo = get_isOnDemo()

    if  isOn == "on" and (is_paid == "true" or isOnDemo == "on"):
        print("Пользователь оплатил тариф. Запуск бота...")
        async with async_playwright() as playwright:
            await process_products(playwright)
    else:
        print("❌ Пользователь не оплатил тариф. Бот не будет запущен. or the bot is not set to on")

# Запуск основной функции
asyncio.run(main())