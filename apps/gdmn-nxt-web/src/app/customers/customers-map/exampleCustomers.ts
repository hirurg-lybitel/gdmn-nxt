interface ICustomer {
  id: number;
  name: string;
  address: string;
  coordinates: {lat: number, lng: number}
}

export const customers: ICustomer[] = [
  {
    id: 192509801,
    name: 'Micro-star International Co., Ltd (Тайвань)',
    address: '№ 69, Li-De Street, Jung-He City, Tapei Hsien Taiwan',
    coordinates: { lat: 25.125240, lng: 121.449640 }
  },
  {
    id: 330969404,
    name: 'Частное торговое униторное предприятие "Талер-плюс"',
    address: 'ямдельский район, д.Нарочь, ул.Пионерская, д. 16',
    coordinates: { lat: 53.99889, lng: 37.529994 }
  },
  {
    id: 172792870,
    name: 'ЧУП "Единая торговая компания"',
    address: 'юридический: 223017, Минский р-н, с/с Новодворский д.5,пом.78 почтовый: 220123, г. Минск, ул. Кропоткина, 93а',
    coordinates: { lat: 53.900293, lng: 27.548915 }
  },
  {
    id: 305906090,
    name: 'ОАО "СПРС"',
    address: 'юридический: 220035, г. Минск, ул. Тимирязева, 65А, пом.221, 223039 , Ждановичский с/с, район деревни Таборы, АБК, к.51, Минский р-н',
    coordinates: { lat: 53.90272, lng: 28.032314 }
  },
  {
    id: 162717844,
    name: 'Синдиколор ЧТПУП  г.Сморгонь',
    address: 'Юридический адрес:ул. Первомайская,47, 231000, г.Сморгонь Почтовый адрес: ул.Я.Коласа,63, 231000, г.Сморгонь',
    coordinates: { lat: 49.687860, lng: 83.292840 }
  },
  {
    id: 148330715,
    name: 'СП ООО "Тибериум"',
    address: 'Юридический адрес:220104,Г.Минск,ул.Лынькова, 27,ком.11 Почтовый адрес:220075,Минская обл.,Минский район,СЭЗ "Минск" ул',
    coordinates: { lat: 46.464430, lng: 47.965980 }
  },
  {
    id: 173896281,
    name: 'СООО "БЭРРИ-Трэйд"',
    address: 'Юридический адрес: ул.Кирова, 151, 222910, г.Старые Дороги 220030 г.Минск, ул. Свердлова, 2-48',
    coordinates: { lat: 43.476190, lng: 43.865780 }
  },
  {
    id: 163461627,
    name: 'ЗАО "Центр сертификации медицинской продукции" г.Екатеринбург(Россия)',
    address: 'Юридический адрес: Россия, 620219, Екатеринбург, пер.Отдельный, 3 Почтовый адрес: Россия, 620014, Екатеринбург, а/я 200',
    coordinates: { lat: 56.837540, lng: 60.648670 }
  },
  {
    id: 339614294,
    name: 'Учреждение "СоциоЭкоЦентр"',
    address: '220049 г.Минск, ул.Волгоградская, 13, каб.213-56',
    coordinates: { lat: 53.934262, lng: 27.606594 }
  },
  {
    id: 158130822,
    name: 'СООО "Златка"',
    address: '220006, г.Минск, ул.Семенова 20, пом.1,каб.10',
    coordinates: { lat: 53.916472, lng: 27.46378 }
  },

];
