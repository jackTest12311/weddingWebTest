'use client';

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { weddingConfig } from '../../config/wedding-config';

declare global {
  interface Window {
    naver: any;
  }
}

// 텍스트의 \n을 <br />로 변환하는 함수
const formatTextWithLineBreaks = (text: string) => {
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

interface VenueSectionProps {
  bgColor?: 'white' | 'beige';
}

const VenueSection = ({ bgColor = 'white' }: VenueSectionProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [mapError, setMapError] = useState(false);
  // 배차 안내 펼침/접기 상태 관리
  const [expandedShuttle, setExpandedShuttle] = useState<'groom' | 'bride' | null>(null);
  
  // 배차 안내 펼침/접기 토글 함수
  const toggleShuttle = (shuttle: 'groom' | 'bride') => {
    if (expandedShuttle === shuttle) {
      setExpandedShuttle(null);
    } else {
      setExpandedShuttle(shuttle);
    }
  };
  
  // ✅ 네이버 지도 로드 + 초기화 (기존 3개 useEffect 전부 교체)
useEffect(() => {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID!;

  // 디버그 표시(원래 있던 debugInfo 유지)
  const debug = clientId
    ? `클라이언트 ID: ${clientId.substring(0, 3)}...`
    : `클라이언트 ID: (undefined)`;
  setDebugInfo(debug);

  // ✅ env 없으면 여기서 끝 (인증 실패 UI 대신 staticMap으로)
  if (!clientId) {
    console.error("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID is undefined. Check .env.local and restart dev server.");
    setMapError(true);
    return;
  }

  let cancelled = false;

  const loadScript = () =>
    new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") return reject(new Error("Not in browser"));

      // 이미 로드됨
      if (window.naver?.maps) return resolve();

      // 중복 삽입 방지
      const existing = document.getElementById("naver-maps-sdk") as HTMLScriptElement | null;
      if (existing) {
        const timer = setInterval(() => {
          if (window.naver?.maps) {
            clearInterval(timer);
            resolve();
          }
        }, 50);

        setTimeout(() => {
          clearInterval(timer);
          if (!window.naver?.maps) reject(new Error("Naver maps load timeout"));
        }, 8000);

        return;
      }

      const script = document.createElement("script");
      script.id = "naver-maps-sdk";
      script.async = true;
      script.defer = true;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Naver maps script"));

      document.head.appendChild(script);
    });

  const init = async () => {
    try {
      await loadScript();
      if (cancelled) return;

      if (!mapRef.current) return;

      console.log("네이버 지도 초기화 시작");

      const naver = window.naver;
      const venueLocation = new naver.maps.LatLng(
        weddingConfig.venue.coordinates.latitude,
        weddingConfig.venue.coordinates.longitude
      );

      const map = new naver.maps.Map(mapRef.current, {
        center: venueLocation,
        zoom: parseInt(weddingConfig.venue.mapZoom, 10) || 15,
        zoomControl: true,
        zoomControlOptions: { position: naver.maps.Position.RIGHT_TOP },
      });

      new naver.maps.Marker({
        position: venueLocation,
        map,
      });

      const infoWindow = new naver.maps.InfoWindow({
        content: `<div style="padding:10px;min-width:150px;text-align:center;font-size:14px;"><strong>${weddingConfig.venue.name}</strong></div>`,
      });
      infoWindow.open(map, new naver.maps.Marker({ position: venueLocation, map }));

      setMapLoaded(true);
      setMapError(false);

      console.log("네이버 지도 초기화 완료");
    } catch (e) {
      console.error("네이버 지도 로드/초기화 실패:", e);
      setMapError(true);
    }
  };

  init();

  return () => {
    cancelled = true;
    if (mapRef.current) mapRef.current.innerHTML = "";
  };
}, []);
  
  // 정적 지도 이미지 렌더링 (API 인증 실패 시 대체 콘텐츠)
  const renderStaticMap = () => {
    return (
      <StaticMapContainer>
        <StaticMapImage src="https://navermaps.github.io/maps.js.ncp/docs/img/example-static-map.png" alt="호텔 위치" />
        <MapOverlay>
          <VenueName style={{ color: 'white', marginBottom: '0.5rem' }}>{weddingConfig.venue.name}</VenueName>
          <VenueAddress style={{ color: 'white', fontSize: '0.9rem' }}>{weddingConfig.venue.address}</VenueAddress>
        </MapOverlay>
      </StaticMapContainer>
    );
  };
  
  // 길찾기 링크 생성 함수들
  const navigateToNaver = () => {
    if (typeof window !== 'undefined') {
      // 네이버 지도 앱/웹으로 연결하는 URL (새로운 형식)
      const naverMapsUrl = `https://map.naver.com/p/directions/-/-/-/walk/place/${weddingConfig.venue.placeId}?c=${weddingConfig.venue.mapZoom},0,0,0,dh`;
      window.open(naverMapsUrl, '_blank');
    }
  };
  
  const navigateToKakao = () => {
    if (typeof window !== 'undefined') {
      // 카카오맵 앱/웹으로 연결
      const lat = weddingConfig.venue.coordinates.latitude;
      const lng = weddingConfig.venue.coordinates.longitude;
      const name = encodeURIComponent(weddingConfig.venue.name);
      const address = encodeURIComponent(weddingConfig.venue.address);
      const kakaoMapsUrl = `https://map.kakao.com/link/to/${name},${lat},${lng}`;
      window.open(kakaoMapsUrl, '_blank');
    }
  };
  
  const navigateToTmap = () => {
    if (typeof window !== 'undefined') {
      // TMAP 앱으로 연결 (앱 딥링크만 사용)
      const lat = weddingConfig.venue.coordinates.latitude;
      const lng = weddingConfig.venue.coordinates.longitude;
      const name = encodeURIComponent(weddingConfig.venue.name);
      
      // 모바일 디바이스에서는 앱 실행 시도
      window.location.href = `tmap://route?goalname=${name}&goaly=${lat}&goalx=${lng}`;
      
      // 앱이 설치되어 있지 않을 경우를 대비해 약간의 지연 후 TMAP 웹사이트로 이동
      setTimeout(() => {
        // TMAP이 설치되어 있지 않으면 TMAP 웹사이트 메인으로 이동
        if(document.hidden) return; // 앱이 실행되었으면 아무것도 하지 않음
        window.location.href = 'https://tmap.co.kr';
      }, 1000);
    }
  };
  
  return (
    <VenueSectionContainer $bgColor={bgColor}>
      <SectionTitle>장소</SectionTitle>
      
      <VenueInfo>
        <VenueName>{weddingConfig.venue.name}</VenueName>
        <VenueAddress>{formatTextWithLineBreaks(weddingConfig.venue.address)}</VenueAddress>
        <VenueTel href={`tel:${weddingConfig.venue.tel}`}>{weddingConfig.venue.tel}</VenueTel>
      </VenueInfo>
      
      {mapError ? (
        renderStaticMap()
      ) : (
        <MapContainer ref={mapRef}>
          {!mapLoaded && <MapLoading>지도를 불러오는 중...{debugInfo}</MapLoading>}
        </MapContainer>
      )}
      
      <NavigateButtonsContainer>
        <NavigateButton onClick={navigateToNaver} $mapType="naver">
          네이버 지도
        </NavigateButton>
        <NavigateButton onClick={navigateToKakao} $mapType="kakao">
          카카오맵
        </NavigateButton>
        <NavigateButton onClick={navigateToTmap} $mapType="tmap">
          TMAP
        </NavigateButton>
      </NavigateButtonsContainer>
      
      <TransportCard>
        <CardTitle>대중교통 안내</CardTitle>
        <TransportItem>
          <TransportLabel>지하철</TransportLabel>
          <TransportText>{weddingConfig.venue.transportation.subway}</TransportText>
        </TransportItem>
        <TransportItem>
          <TransportLabel>버스</TransportLabel>
          <TransportText>{weddingConfig.venue.transportation.bus}</TransportText>
        </TransportItem>
      </TransportCard>
      
      <ParkingCard>
        <CardTitle>주차 안내</CardTitle>
        <TransportText>{weddingConfig.venue.parking}</TransportText>
      </ParkingCard>
      
      {/* 신랑측 배차 안내 - 정보가 있을 때만 표시 */}
      {weddingConfig.venue.groomShuttle && (
        <ShuttleCard>
          <ShuttleCardHeader onClick={() => toggleShuttle('groom')} $isExpanded={expandedShuttle === 'groom'}>
            <CardTitle>신랑측 배차 안내</CardTitle>
            <ExpandIcon $isExpanded={expandedShuttle === 'groom'}>
              {expandedShuttle === 'groom' ? '−' : '+'}
            </ExpandIcon>
          </ShuttleCardHeader>
          
          {expandedShuttle === 'groom' && (
            <ShuttleContent>
              <ShuttleInfo>
                <ShuttleLabel>탑승 장소</ShuttleLabel>
                <ShuttleText>{formatTextWithLineBreaks(weddingConfig.venue.groomShuttle.location)}</ShuttleText>
              </ShuttleInfo>
              <ShuttleInfo>
                <ShuttleLabel>출발 시간</ShuttleLabel>
                <ShuttleText>{weddingConfig.venue.groomShuttle.departureTime}</ShuttleText>
              </ShuttleInfo>
              <ShuttleInfo>
                <ShuttleLabel>인솔자</ShuttleLabel>
                <ShuttleText>
                  {weddingConfig.venue.groomShuttle.contact.name} ({weddingConfig.venue.groomShuttle.contact.tel})
                  <ShuttleCallButton href={`tel:${weddingConfig.venue.groomShuttle.contact.tel}`}>
                    전화
                  </ShuttleCallButton>
                </ShuttleText>
              </ShuttleInfo>
            </ShuttleContent>
          )}
        </ShuttleCard>
      )}
      
      {/* 신부측 배차 안내 - 정보가 있을 때만 표시 */}
      {weddingConfig.venue.brideShuttle && (
        <ShuttleCard>
          <ShuttleCardHeader onClick={() => toggleShuttle('bride')} $isExpanded={expandedShuttle === 'bride'}>
            <CardTitle>신부측 배차 안내</CardTitle>
            <ExpandIcon $isExpanded={expandedShuttle === 'bride'}>
              {expandedShuttle === 'bride' ? '−' : '+'}
            </ExpandIcon>
          </ShuttleCardHeader>
          
          {expandedShuttle === 'bride' && (
            <ShuttleContent>
              <ShuttleInfo>
                <ShuttleLabel>탑승 장소</ShuttleLabel>
                <ShuttleText>{formatTextWithLineBreaks(weddingConfig.venue.brideShuttle.location)}</ShuttleText>
              </ShuttleInfo>
              <ShuttleInfo>
                <ShuttleLabel>출발 시간</ShuttleLabel>
                <ShuttleText>{weddingConfig.venue.brideShuttle.departureTime}</ShuttleText>
              </ShuttleInfo>
              <ShuttleInfo>
                <ShuttleLabel>인솔자</ShuttleLabel>
                <ShuttleText>
                  {weddingConfig.venue.brideShuttle.contact.name} ({weddingConfig.venue.brideShuttle.contact.tel})
                  <ShuttleCallButton href={`tel:${weddingConfig.venue.brideShuttle.contact.tel}`}>
                    전화
                  </ShuttleCallButton>
                </ShuttleText>
              </ShuttleInfo>
            </ShuttleContent>
          )}
        </ShuttleCard>
      )}
    </VenueSectionContainer>
  );
};

const VenueSectionContainer = styled.section<{ $bgColor: 'white' | 'beige' }>`
  padding: 4rem 1.5rem;
  text-align: center;
  background-color: ${props => props.$bgColor === 'beige' ? '#F8F6F2' : 'white'};
`;

const SectionTitle = styled.h2`
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
  font-weight: 500;
  font-size: 1.5rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--secondary-color);
  }
`;

const VenueInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const VenueName = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const VenueAddress = styled.p`
  margin-bottom: 0.5rem;
`;

const VenueTel = styled.a`
  color: var(--secondary-color);
  text-decoration: none;
`;

const MapContainer = styled.div`
  height: 16rem;
  margin-bottom: 1rem;
  background-color: #f1f1f1;
  border-radius: 8px;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
  position: relative;
`;

const StaticMapContainer = styled.div`
  height: 16rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;
`;

const StaticMapImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MapOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 1rem;
  text-align: center;
`;

const MapLoading = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-medium);
`;

const NavigateButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
`;

const NavigateButton = styled.button<{ $mapType?: 'naver' | 'kakao' | 'tmap' }>`
  flex: 1;
  min-width: 6rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #c4a986;
    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }
  
  &:active:after {
    animation: ripple 0.6s ease-out;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    20% {
      transform: scale(25, 25);
      opacity: 0.3;
    }
    100% {
      opacity: 0;
      transform: scale(40, 40);
    }
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
  text-align: left;
`;

const TransportCard = styled(Card)``;
const ParkingCard = styled(Card)``;
const ShuttleCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const CardTitle = styled.h4`
  font-weight: 500;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const TransportItem = styled.div`
  margin-bottom: 1rem;
`;

const TransportLabel = styled.p`
  font-weight: 500;
  font-size: 0.875rem;
`;

const TransportText = styled.p`
  font-size: 0.875rem;
  color: var(--text-medium);
  white-space: pre-line;
`;

const ShuttleInfo = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ShuttleLabel = styled.p`
  font-weight: 500;
  font-size: 0.875rem;
`;

const ShuttleText = styled.p`
  font-size: 0.875rem;
  color: var(--text-medium);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ShuttleCallButton = styled.a`
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  text-decoration: none;
  margin-left: 0.5rem;
  position: relative;
  overflow: hidden;
  
  &:active {
    transform: translateY(1px);
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }
  
  &:active:after {
    animation: ripple 0.6s ease-out;
  }
`;

const ShuttleCardHeader = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  border-bottom: ${props => props.$isExpanded ? '1px solid #eee' : 'none'};
  
  h4 {
    margin: 0;
  }
`;

const ExpandIcon = styled.span<{ $isExpanded: boolean }>`
  font-size: 1.5rem;
  line-height: 1;
  color: var(--secondary-color);
  transition: transform 0.3s ease;
  transform: ${props => props.$isExpanded ? 'rotate(0deg)' : 'rotate(0deg)'};
`;

const ShuttleContent = styled.div`
  padding: 1rem 1.5rem 1.5rem;
`;

export default VenueSection; 