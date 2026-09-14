/**
 * 神奈川県内の火葬場マーカー（地図表示用）。
 * 名称・住所・料金目安は公開情報を参考（小さなお葬式コラム等）。
 * 写真・電話番号は掲載しない。
 * @see https://www.osohshiki.jp/column/article/382/
 */
import { DEMO_CREMATORIUM_PIN } from "@/lib/constants/demo-crematorium";
export type KanagawaCrematoriumPin = {
  id: string;
  name: string;
  address: string;
  municipalityName: string;
  lat: number;
  lng: number;
  usageFeeNote?: string;
  isPrivate?: boolean;
  /** 練習・デモ専用（実在施設ではない） */
  isDemo?: boolean;
};

/** 神奈川県のおおよその境界（% 変換用） */
export const KANAGAWA_MAP_BOUNDS = {
  minLat: 35.12,
  maxLat: 35.65,
  minLng: 139.05,
  maxLng: 139.75,
} as const;

export const KANAGAWA_CREMATORIUM_SOURCE_URL =
  "https://www.osohshiki.jp/column/article/382/";

export const KANAGAWA_CREMATORIUMS: KanagawaCrematoriumPin[] = [
  DEMO_CREMATORIUM_PIN,
  {
    id: "kuboyama",
    name: "久保山斎場",
    address: "神奈川県横浜市西区元久保町3-1",
    municipalityName: "横浜市",
    lat: 35.4458,
    lng: 139.6185,
    usageFeeNote: "12,000円（横浜市民）",
  },
  {
    id: "totsuka",
    name: "戸塚斎場",
    address: "神奈川県横浜市戸塚区鳥が丘10-5",
    municipalityName: "横浜市",
    lat: 35.3968,
    lng: 139.4902,
    usageFeeNote: "12,000円（横浜市民）",
  },
  {
    id: "yokohama-hokubu",
    name: "横浜市北部斎場",
    address: "神奈川県横浜市緑区長津田町5125-1",
    municipalityName: "横浜市",
    lat: 35.5491,
    lng: 139.4994,
    usageFeeNote: "12,000円（横浜市民）",
  },
  {
    id: "yokohama-minami",
    name: "横浜市南部斎場",
    address: "神奈川県横浜市金沢区みず木町1",
    municipalityName: "横浜市",
    lat: 35.3578,
    lng: 139.6225,
    usageFeeNote: "12,000円（横浜市民）",
  },
  {
    id: "kawasaki-kita",
    name: "かわさき北部斎苑",
    address: "神奈川県川崎市高津区下作延6-18-1",
    municipalityName: "川崎市",
    lat: 35.5905,
    lng: 139.593,
    usageFeeNote: "6,750円（川崎市民）",
  },
  {
    id: "kawasaki-minami",
    name: "かわさき南部斎苑",
    address: "神奈川県川崎市川崎区夜光3-2-7",
    municipalityName: "川崎市",
    lat: 35.5288,
    lng: 139.7156,
    usageFeeNote: "6,750円（川崎市民）",
  },
  {
    id: "aikawa",
    name: "愛川聖苑",
    address: "神奈川県愛甲郡愛川町棚沢941-1",
    municipalityName: "愛川町",
    lat: 35.521,
    lng: 139.3135,
    usageFeeNote: "8,000円（愛川町民）",
  },
  {
    id: "atsugi",
    name: "厚木市斎場",
    address: "神奈川県厚木市下古沢548",
    municipalityName: "厚木市",
    lat: 35.4545,
    lng: 139.351,
    usageFeeNote: "10,000円（厚木市民）",
  },
  {
    id: "odawara",
    name: "小田原市斎場",
    address: "神奈川県小田原市久野3664-8",
    municipalityName: "小田原市",
    lat: 35.2835,
    lng: 139.152,
    usageFeeNote: "無料（小田原市民）ほか条件あり",
  },
  {
    id: "sagamihara",
    name: "相模原市営斎場",
    address: "神奈川県相模原市古淵5-26-1",
    municipalityName: "相模原市",
    lat: 35.5895,
    lng: 139.419,
    usageFeeNote: "6,000円（相模原市民）",
  },
  {
    id: "chigasaki",
    name: "茅ヶ崎市斎場",
    address: "神奈川県茅ケ崎市芹沢1700",
    municipalityName: "茅ヶ崎市",
    lat: 35.3695,
    lng: 139.388,
    usageFeeNote: "無料（茅ヶ崎市民）",
  },
  {
    id: "hadano",
    name: "秦野斎場",
    address: "神奈川県秦野市曽屋1006",
    municipalityName: "秦野市",
    lat: 35.371,
    lng: 139.228,
    usageFeeNote: "11,000円（秦野市民）",
  },
  {
    id: "hiratsuka",
    name: "平塚市聖苑",
    address: "神奈川県平塚市田村九丁目25-2",
    municipalityName: "平塚市",
    lat: 35.336,
    lng: 139.365,
    usageFeeNote: "無料（平塚市民）",
  },
  {
    id: "fujisawa",
    name: "藤沢聖苑",
    address: "神奈川県藤沢市大鋸1225",
    municipalityName: "藤沢市",
    lat: 35.4005,
    lng: 139.472,
    usageFeeNote: "10,000円（藤沢市民）",
  },
  {
    id: "manazuru",
    name: "真鶴聖苑",
    address: "神奈川県足柄下郡真鶴町真鶴1916",
    municipalityName: "真鶴町",
    lat: 35.156,
    lng: 139.6225,
    usageFeeNote: "無料（真鶴町民または湯河原町民）",
  },
  {
    id: "miura",
    name: "三浦市火葬場",
    address: "神奈川県三浦市三崎町六合1019",
    municipalityName: "三浦市",
    lat: 35.136,
    lng: 139.632,
    usageFeeNote: "8,000円（三浦市民）",
  },
  {
    id: "yamato",
    name: "大和斎場",
    address: "神奈川県大和市西鶴間8-10-8",
    municipalityName: "大和市",
    lat: 35.471,
    lng: 139.441,
    usageFeeNote: "10,000円（大和市・海老名市・座間市・綾瀬市民）",
  },
  {
    id: "yokosuka",
    name: "横須賀市中央斎場",
    address: "神奈川県横須賀市坂本町6-18",
    municipalityName: "横須賀市",
    lat: 35.283,
    lng: 139.668,
    usageFeeNote: "10,000円（横須賀市民）",
  },
  {
    id: "nishiterao",
    name: "西寺尾火葬場",
    address: "神奈川県横浜市旭区西寺尾町779",
    municipalityName: "横浜市",
    lat: 35.438,
    lng: 139.552,
    usageFeeNote: "民営（56,000円〜85,000円）",
    isPrivate: true,
  },
  {
    id: "ozu",
    name: "小坪誠行社斎場",
    address: "神奈川県逗子市小坪5-8-1",
    municipalityName: "逗子市",
    lat: 35.298,
    lng: 139.578,
    usageFeeNote: "民営（逗子・鎌倉・葉山エリア）",
    isPrivate: true,
  },
];

export function latLngToMapPercent(lat: number, lng: number) {
  const { minLat, maxLat, minLng, maxLng } = KANAGAWA_MAP_BOUNDS;
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
  return {
    x: Math.min(96, Math.max(4, x)),
    y: Math.min(94, Math.max(6, y)),
  };
}

export function getCrematoriumPinBySlug(slug: string) {
  return KANAGAWA_CREMATORIUMS.find((pin) => pin.id === slug);
}

export function crematoriumDetailPath(
  role: "funeral_company" | "freelancer",
  pin: { id: string; dbId?: string },
) {
  const base =
    role === "funeral_company" ? "/funeral-company" : "/freelancer";
  if (pin.dbId) {
    return `${base}/facilities/${pin.dbId}/staff`;
  }
  return `${base}/facilities/s/${pin.id}`;
}
