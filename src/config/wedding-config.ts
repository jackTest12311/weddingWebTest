const uniqueIdentifier = "JWK-WEDDING-TEMPLATE-V1";
interface ShuttleInfo {
  location: string;
  departureTime: string;
  contact: {
    name: string;
    tel: string;
  };
}

interface VenueConfig {
  name: string;
  address: string;
  tel: string;
  naverMapId: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  placeId: string;
  mapZoom: string;
  mapNaverCoordinates: string;
  transportation: {
    subway: string;
    bus: string;
  };
  parking: string;

  // ✅ optional
  groomShuttle?: ShuttleInfo;
  brideShuttle?: ShuttleInfo;
}
// 갤러리 레이아웃 타입 정의
type GalleryLayout = "scroll" | "grid";
type GalleryPosition = "middle" | "bottom";

interface GalleryConfig {
  layout: GalleryLayout;
  position: GalleryPosition;
  images: string[];
}

export const weddingConfig = {
  // 메타 정보
  meta: {
    title: "신랑 신윤섭 ❤️ 신부 이희명의 결혼식에 초대합니다",
    description: "결혼식 초대장",
    ogImage: "/images/main.jpg",
    noIndex: true,
    _jwk_watermark_id: uniqueIdentifier,
  },

  // 메인 화면
  main: {
    title: "Wedding Invitation",
    image: "/images/main.jpg",
    date: "2026년 5월 25일 월요일 11시 00분",
    venue: "아펠가모 반포"
  },

  // 소개글
  intro: {
    title: "",
    text: "서로를 바라보며 걸어온\n소중한 발걸음이\n이제 하나의 길로 이어집니다.\n\n사랑과 믿음으로\n새 가정을 이루는 저희 두 사람의\n작은 시작을 알려드립니다."
  },

  // 결혼식 일정
  date: {
    year: 2026,
    month: 5,
    day: 25,
    hour: 11,
    minute: 0,
    displayDate: "2026.05.25 SAT AM 11:00",
  },

  // 장소 정보
  venue: {
    name: "아펠가모 반포",
    address: "서울특별시 서초구 반포대로 235 LL층\n아펠가모 반포",
    tel: "02-3431-0230",
    naverMapId: "아펠가모 반포", // 네이버 지도 검색용 장소명
    coordinates: {
      latitude: 37.500856,
      longitude: 127.003314,
    },
    placeId: "1766687615", // 네이버 지도 장소 ID
    mapZoom: "17", // 지도 줌 레벨
    mapNaverCoordinates: "14137937.9205911,4509125.2082041", // 네이버 지도 길찾기 URL용 좌표 파라미터 (구 형식)
    transportation: {
      subway: "지하철 7호선 고속터미널역 5번 출구에서 도보 5분",
      bus: "간선\n 405, 740\n지선\n 5413\n마을\n 서초13, 서초14, 서초21",
    },
    parking: "건물 지하 주차장 이용 가능 (2시간 무료)", 
    
    
    // 신랑측 배차 안내
    // groomShuttle: {
    //   location: "신랑측 배차 출발지",
    //   departureTime: "오전 10시 30분 출발",
    //   contact: {
    //     name: "담당자명",
    //     tel: "010-1234-5678"
    //   }
    // },
    // 신부측 배차 안내
    // brideShuttle: {
    //   location: "신부측 배차 출발지",
    //   departureTime: "오전 11시 출발",
    //   contact: {
    //     name: "담당자명",
    //     tel: "010-9876-5432"
    //   }
    // }
  } as VenueConfig,

  // 갤러리
  gallery: {
    layout: "grid" as GalleryLayout, // "scroll" 또는 "grid" 선택
    position: "bottom" as GalleryPosition, // "middle" (현재 위치) 또는 "bottom" (맨 하단) 선택
    images: [
      "/images/gallery/image1.jpg",
      "/images/gallery/image2.jpg",
      "/images/gallery/image3.jpg",
      "/images/gallery/image4.jpg",
      "/images/gallery/image5.jpg",
      "/images/gallery/image6.jpg",
      "/images/gallery/image7.jpg",
      "/images/gallery/image8.jpg",
      "/images/gallery/image9.jpg",
      "/images/gallery/image10.jpg",
      "/images/gallery/image11.jpg",
      "/images/gallery/image12.jpg",
      "/images/gallery/image13.jpg",
      "/images/gallery/image14.jpg",
      "/images/gallery/image15.jpg",
      "/images/gallery/image16.jpg",
      "/images/gallery/image17.jpg",
      "/images/gallery/image18.jpg",
    ],
  } as GalleryConfig,

  // 초대의 말씀
  invitation: {
    message: "한 줄기 별빛이 되어 만난 인연\n평생을 함께 걸어가려 합니다.\n\n소중한 분들의 축복 속에\n저희 두 사람이 첫 걸음을 내딛습니다.\n\n귀한 시간 내어 함께해 주신다면\n그 어떤 축복보다 값진 선물이 될 것입니다.",
    groom: {
      name: "신윤섭",
      label: "아들",
      father: "신동진",
      mother: "이석미",
    },
    bride: {
      name: "이희명",
      label: "딸",
      father: "이삼구",
      mother: "박형숙",
    },
  },

  // 계좌번호
  account: {
    groom: {
      bank: "은행명",
      number: "123-456-789012",
      holder: "신랑이름",
    },
    bride: {
      bank: "은행명",
      number: "987-654-321098",
      holder: "신부이름",
    },
    groomFather: {
      bank: "은행명",
      number: "111-222-333444",
      holder: "신랑아버지",
    },
    groomMother: {
      bank: "은행명",
      number: "555-666-777888",
      holder: "신랑어머니",
    },
    brideFather: {
      bank: "은행명",
      number: "999-000-111222",
      holder: "신부아버지",
    },
    brideMother: {
      bank: "은행명",
      number: "333-444-555666",
      holder: "신부어머니",
    }
  },

  // RSVP 설정
  rsvp: {
    enabled: true, // RSVP 섹션 표시 여부
    showMealOption: true, // 식사 여부 입력 옵션 표시 여부
  },

  slack: {
    channel: "#wedding-response",
    compactMessage: true,
  },
}; 
