const pool = require('./database/db');

const updateImages = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Map of attraction names to image files
    const imageMap = {
      'Сарминское ущелье': '7.jpg',
      'Водопад Малый Жом-Болок': '9.jpg',
      'Водопад Кынгарга': '10.jpg',
      'Горячинск': '11.jpg',
      'Иволгинский дацан': '12.jpg',
      'Ринпоче Багша': '13.jpg',
      'Дацан богини Янжимы': '14.jpg',
      'Балдан Брэйбун': '15.jpg',
      'Баргузинская долина': '16.jpg',
      'Тункинская долина': '17.jpg',
      'Долина потухших вулканов': '18.jpg',
      'Гора Мамай': '19.jpg',
      'Аршан': '20.jpg',
      'Шумакские источники': '21.jpg',
      'Ильинка (Питателевский источник)': '22.jpg',
      'Памятник Ленину (Голова)': '24.jpg',
      'Площадь Советов': '25.jpg',
      'Пешеходная улица Ленина (Арбат)': '26.jpg',
      'Театр оперы и балета': '27.jpg',
      'Музей истории Улан-Удэ': '28.jpg',
      'Центр современного искусства «Залуу»': '29.jpg',
      'Степной кочевник': '30.jpg',
      'Байкальский биосферный заповедник': '32.jpg',
      'Баргузинский заповедник': '33.jpg',
      'Забайкальский национальный парк': '35.jpg',
      'Фролихинский заказник': '36.jpg'
    };

    for (const [name, imageFile] of Object.entries(imageMap)) {
      const imageUrl = `/images/attractions/${imageFile}`;
      await client.query(
        'UPDATE destinations SET image_url = $1 WHERE name_ru = $2',
        [imageUrl, name]
      );
      console.log(`Updated ${name} with ${imageUrl}`);
    }

    await client.query('COMMIT');
    console.log('All images updated successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating images:', error);
  } finally {
    client.release();
  }
};

updateImages().then(() => process.exit(0)).catch(() => process.exit(1));