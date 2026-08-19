// Generator data klub sintetis -> MongoDB (menambah hingga TARGET_TOTAL klub)
// Jalankan lokal:  npm run generate   (Mongo harus jalan di localhost:27017)
// Atau via docker: docker compose run --rm seed node dist/seed/generate.js
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/almanakklub';
const TARGET_TOTAL = parseInt(process.env.TARGET_TOTAL || '1200', 10);

interface CountryDef {
  country: string;
  league1: string;
  league2: string;
  cities: string[];
}

const COUNTRIES: CountryDef[] = [
  { country: 'Brasil', league1: 'Serie A Brasileiro', league2: 'Serie B Brasileiro', cities: ['Sao Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre', 'Salvador', 'Recife', 'Fortaleza', 'Curitiba', 'Manaus', 'Brasilia', 'Goiania', 'Campinas', 'Santos', 'Natal', 'Maceio', 'Belem', 'Florianopolis', 'Cuiaba', 'Vitoria', 'Londrina'] },
  { country: 'Argentina', league1: 'Liga Profesional', league2: 'Primera Nacional', cities: ['Buenos Aires', 'Cordoba', 'Rosario', 'Mendoza', 'La Plata', 'Tucuman', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan', 'Neuquen', 'Parana', 'Posadas', 'Bahia Blanca', 'Corrientes', 'San Luis', 'Jujuy', 'Formosa', 'Rio Cuarto', 'Lanus'] },
  { country: 'Belanda', league1: 'Eredivisie', league2: 'Eerste Divisie', cities: ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen', 'Arnhem', 'Haarlem', 'Enschede', 'Zwolle', 'Leiden', 'Maastricht', 'Dordrecht', 'Leeuwarden', 'Alkmaar', 'Venlo'] },
  { country: 'Portugal', league1: 'Primeira Liga', league2: 'Liga Portugal 2', cities: ['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Funchal', 'Setubal', 'Aveiro', 'Faro', 'Guimaraes', 'Evora', 'Viseu', 'Leiria', 'Portimao', 'Covilha', 'Barcelos', 'Famalicao', 'Estoril', 'Amadora', 'Chaves', 'Tondela'] },
  { country: 'Jepang', league1: 'J1 League', league2: 'J2 League', cities: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Kobe', 'Fukuoka', 'Kyoto', 'Hiroshima', 'Sendai', 'Kawasaki', 'Saitama', 'Chiba', 'Niigata', 'Shizuoka', 'Kumamoto', 'Okayama', 'Kanazawa', 'Nagasaki', 'Oita'] },
  { country: 'Korea Selatan', league1: 'K League 1', league2: 'K League 2', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Jeonju', 'Pohang', 'Changwon', 'Seongnam', 'Cheonan', 'Bucheon', 'Ansan', 'Gimpo', 'Jeju', 'Gangwon', 'Cheongju', 'Gimcheon'] },
  { country: 'Amerika Serikat', league1: 'MLS', league2: 'USL Championship', cities: ['Los Angeles', 'New York', 'Chicago', 'Houston', 'Miami', 'Seattle', 'Atlanta', 'Dallas', 'Denver', 'Portland', 'Boston', 'Philadelphia', 'Phoenix', 'San Diego', 'Nashville', 'Austin', 'Orlando', 'Columbus', 'Kansas City', 'Cincinnati'] },
  { country: 'Meksiko', league1: 'Liga MX', league2: 'Liga de Expansion MX', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Leon', 'Toluca', 'Queretaro', 'Pachuca', 'Torreon', 'San Luis Potosi', 'Aguascalientes', 'Morelia', 'Cancun', 'Merida', 'Culiacan', 'Hermosillo', 'Veracruz', 'Chihuahua', 'Zacatecas'] },
  { country: 'Turki', league1: 'Super Lig', league2: '1. Lig', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Trabzon', 'Gaziantep', 'Kayseri', 'Samsun', 'Eskisehir', 'Denizli', 'Mersin', 'Diyarbakir', 'Malatya', 'Erzurum', 'Sivas', 'Rize', 'Sakarya'] },
  { country: 'Belgia', league1: 'Pro League', league2: 'Challenger Pro League', cities: ['Brussels', 'Antwerp', 'Gent', 'Brugge', 'Liege', 'Charleroi', 'Leuven', 'Mechelen', 'Kortrijk', 'Oostende', 'Genk', 'Sint-Truiden', 'Mons', 'Namur', 'Aalst', 'Hasselt', 'Roeselare', 'Tournai', 'Seraing', 'Westerlo'] },
  { country: 'Skotlandia', league1: 'Scottish Premiership', league2: 'Scottish Championship', cities: ['Glasgow', 'Edinburgh', 'Aberdeen', 'Dundee', 'Perth', 'Inverness', 'Kilmarnock', 'Paisley', 'Falkirk', 'Motherwell', 'Livingston', 'Hamilton', 'Dunfermline', 'Ayr', 'Greenock', 'Airdrie', 'Arbroath', 'Dumbarton', 'Stirling', 'Montrose'] },
  { country: 'Arab Saudi', league1: 'Saudi Pro League', league2: 'Saudi First Division', cities: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Taif', 'Buraidah', 'Abha', 'Tabuk', 'Khobar', 'Hail', 'Najran', 'Jubail', 'Yanbu', 'Al Hasa', 'Jizan', 'Sakaka', 'Arar', 'Al Baha', 'Kharj'] },
  { country: 'Australia', league1: 'A-League', league2: 'NPL', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Newcastle', 'Gold Coast', 'Wollongong', 'Hobart', 'Geelong', 'Townsville', 'Cairns', 'Darwin', 'Ballarat', 'Bendigo', 'Launceston', 'Mackay', 'Rockhampton', 'Toowoomba'] },
  { country: 'Tiongkok', league1: 'Chinese Super League', league2: 'China League One', cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Wuhan', 'Tianjin', 'Chongqing', 'Xian', 'Hangzhou', 'Nanjing', 'Qingdao', 'Dalian', 'Changsha', 'Zhengzhou', 'Jinan', 'Kunming', 'Xiamen', 'Shenyang', 'Harbin'] },
  { country: 'Thailand', league1: 'Thai League 1', league2: 'Thai League 2', cities: ['Bangkok', 'Chiang Mai', 'Pattaya', 'Phuket', 'Nakhon Ratchasima', 'Khon Kaen', 'Udon Thani', 'Chonburi', 'Ratchaburi', 'Nonthaburi', 'Rayong', 'Songkhla', 'Lampang', 'Sukhothai', 'Ayutthaya', 'Trat', 'Chiang Rai', 'Nakhon Pathom', 'Samut Prakan', 'Suphanburi'] },
  { country: 'Malaysia', league1: 'Super League Malaysia', league2: 'Premier League Malaysia', cities: ['Kuala Lumpur', 'Johor Bahru', 'Penang', 'Ipoh', 'Shah Alam', 'Malacca', 'Kota Kinabalu', 'Kuching', 'Kuantan', 'Kota Bharu', 'Alor Setar', 'Seremban', 'Kangar', 'Kuala Terengganu', 'Petaling Jaya', 'Klang', 'Sandakan', 'Miri', 'Taiping', 'Sungai Petani'] },
  { country: 'Vietnam', league1: 'V.League 1', league2: 'V.League 2', cities: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hai Phong', 'Can Tho', 'Hue', 'Nha Trang', 'Vinh', 'Quy Nhon', 'Thanh Hoa', 'Nam Dinh', 'Vung Tau', 'Buon Ma Thuot', 'Pleiku', 'Long Xuyen', 'Thai Nguyen', 'Ha Long', 'Phan Thiet', 'Rach Gia', 'Bac Ninh'] },
  { country: 'India', league1: 'Indian Super League', league2: 'I-League', cities: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad', 'Goa', 'Kochi', 'Pune', 'Jamshedpur', 'Guwahati', 'Bhubaneswar', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Srinagar', 'Shillong', 'Imphal', 'Aizawl'] },
  { country: 'Mesir', league1: 'Egyptian Premier League', league2: 'Egyptian Second Division', cities: ['Cairo', 'Alexandria', 'Giza', 'Port Said', 'Suez', 'Ismailia', 'Tanta', 'Mansoura', 'Aswan', 'Luxor', 'Zagazig', 'Damietta', 'Fayoum', 'Minya', 'Beni Suef', 'Qena', 'Sohag', 'Hurghada', 'Damanhur', 'Arish'] },
  { country: 'Maroko', league1: 'Botola Pro', league2: 'Botola 2', cities: ['Casablanca', 'Rabat', 'Marrakesh', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan', 'Safi', 'El Jadida', 'Nador', 'Khouribga', 'Beni Mellal', 'Mohammedia', 'Laayoune', 'Taza', 'Settat', 'Berkane'] },
  { country: 'Nigeria', league1: 'NPFL', league2: 'Nigeria National League', cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City', 'Kaduna', 'Enugu', 'Jos', 'Ilorin', 'Owerri', 'Calabar', 'Warri', 'Abeokuta', 'Akure', 'Uyo', 'Maiduguri', 'Sokoto', 'Katsina', 'Asaba'] },
  { country: 'Afrika Selatan', league1: 'Premier Soccer League', league2: 'National First Division', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Polokwane', 'Nelspruit', 'Kimberley', 'East London', 'Rustenburg', 'Soweto', 'Pietermaritzburg', 'Vereeniging', 'Welkom', 'Mthatha', 'George', 'Upington', 'Middelburg', 'Thohoyandou'] },
  { country: 'Kolombia', league1: 'Categoria Primera A', league2: 'Categoria Primera B', cities: ['Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Cucuta', 'Ibague', 'Santa Marta', 'Villavicencio', 'Pasto', 'Monteria', 'Neiva', 'Armenia', 'Valledupar', 'Popayan', 'Tunja', 'Rionegro'] },
  { country: 'Chile', league1: 'Primera Division Chile', league2: 'Primera B Chile', cities: ['Santiago', 'Valparaiso', 'Concepcion', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Iquique', 'La Serena', 'Puerto Montt', 'Chillan', 'Osorno', 'Calama', 'Copiapo', 'Valdivia', 'Arica', 'Curico', 'Quillota', 'Coquimbo', 'Punta Arenas'] },
];

const NAME_PATTERNS = [
  (c: string) => `FC ${c}`,
  (c: string) => `${c} United`,
  (c: string) => `${c} City`,
  (c: string) => `Real ${c}`,
  (c: string) => `Sporting ${c}`,
  (c: string) => `Atletico ${c}`,
  (c: string) => `${c} SC`,
  (c: string) => `Deportivo ${c}`,
  (c: string) => `${c} Rovers`,
  (c: string) => `${c} Athletic`,
];

const STADIUM_PATTERNS = [
  (c: string) => `${c} Stadium`,
  (c: string) => `${c} Arena`,
  (c: string) => `Estadio ${c}`,
  (c: string) => `${c} Park`,
  (c: string) => `Stadion ${c}`,
];

const FIRST_NAMES = ['Carlos', 'Diego', 'Luis', 'Marco', 'Jose', 'Kenji', 'Hiro', 'Min-jae', 'Ahmed', 'Omar', 'Yusuf', 'David', 'James', 'Peter', 'Andre', 'Bruno', 'Rafael', 'Sergio', 'Ivan', 'Pablo', 'Victor', 'Felipe', 'Thiago', 'Lucas', 'Gabriel', 'Samuel', 'Daniel', 'Adam', 'Ryan', 'Kofi', 'Chinedu', 'Tariq', 'Hassan', 'Arjun', 'Ravi', 'Somchai', 'Nguyen', 'Budi', 'Agus', 'Farid'];
const LAST_NAMES = ['Silva', 'Santos', 'Rodriguez', 'Martinez', 'Tanaka', 'Sato', 'Kim', 'Lee', 'Hassan', 'Ali', 'Osman', 'Smith', 'Jones', 'Brown', 'Costa', 'Pereira', 'Fernandez', 'Lopez', 'Petrov', 'Novak', 'Muller', 'Kaya', 'Demir', 'Okafor', 'Adebayo', 'Mensah', 'Sharma', 'Patel', 'Chaiyo', 'Tran', 'Wijaya', 'Putra', 'Diallo', 'Toure', 'Mbeki', 'Van Dijk', 'De Boer', 'Rossi', 'Bianchi', 'Moreau'];
const NICKNAMES = ['The Lions', 'The Eagles', 'The Tigers', 'The Warriors', 'Los Rojos', 'The Blues', 'The Reds', 'The Kings', 'The Dragons', 'Los Azules', 'The Wolves', 'The Panthers', 'The Sharks', 'The Falcons', 'The Bulls', 'The Storm', 'The Royals', 'The Miners', 'The Sailors', 'The Hunters'];

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]): T => arr[rand(arr.length)];
const person = () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

function makeClub(def: CountryDef, city: string, division: 1 | 2, patternIdx: number) {
  const name = NAME_PATTERNS[patternIdx % NAME_PATTERNS.length](city);
  const capacity =
    division === 1 ? 15000 + rand(65000) : 3000 + rand(25000);
  return {
    id: randomUUID(),
    club: name,
    country: def.country,
    league: division === 1 ? def.league1 : def.league2,
    division,
    founded: 1890 + rand(120),
    stadium: {
      name: STADIUM_PATTERNS[rand(STADIUM_PATTERNS.length)](city),
      city,
      capacity: Math.round(capacity / 100) * 100,
    },
    coach: person(),
    key_players: [person(), person(), person(), person()],
    trophies: {
      liga_domestik: division === 1 ? rand(15) : rand(4),
      piala_domestik: rand(8),
      internasional: division === 1 ? rand(4) : 0,
    },
    nickname: pick(NICKNAMES),
    rival: '',
  };
}

async function main() {
  if (TARGET_TOTAL > 2000) {
    console.error('TARGET_TOTAL maksimal 2000');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  const col = mongoose.connection.collection('clubs');
  const existing = await col.countDocuments();
  const needed = TARGET_TOTAL - existing;
  if (needed <= 0) {
    console.log(`Sudah ada ${existing} klub (target ${TARGET_TOTAL}). Tidak ada yang ditambahkan.`);
    await mongoose.disconnect();
    return;
  }
  console.log(`Klub saat ini: ${existing}. Menambahkan ${needed} klub baru…`);

  const docs: any[] = [];
  let i = 0;
  outer: while (true) {
    for (const def of COUNTRIES) {
      for (const division of [1, 2] as const) {
        const city = def.cities[i % def.cities.length];
        docs.push(makeClub(def, city, division, i + rand(3)));
        if (docs.length >= needed) break outer;
      }
    }
    i++;
    if (i > 100) break; // pengaman
  }

  // pasangkan rival antar klub senegara
  const byCountry = new Map<string, any[]>();
  for (const d of docs) {
    if (!byCountry.has(d.country)) byCountry.set(d.country, []);
    byCountry.get(d.country)!.push(d);
  }
  for (const list of byCountry.values()) {
    for (let j = 0; j < list.length; j++) {
      list[j].rival = list[(j + 1) % list.length].club;
    }
  }

  await col.insertMany(docs);
  const total = await col.countDocuments();
  console.log(`Selesai. Total klub sekarang: ${total}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('Generate gagal:', e.message);
  process.exit(1);
});
