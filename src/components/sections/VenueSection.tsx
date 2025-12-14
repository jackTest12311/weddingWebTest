'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { weddingConfig } from '../../config/wedding-config';

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
  // 배차 안내 펼침/접기 상태 관리
  const [expandedShuttle, setExpandedShuttle] = useState<'groom' | 'bride' | null>(null);

  // 배차 안내 펼침/접기 토글 함수
  const toggleShuttle = (shuttle: 'groom' | 'bride') => {
    setExpandedShuttle(prev => (prev === shuttle ? null : shuttle));
  };

  // 길찾기 링크 생성 함수들
  const navigateToNaver = () => {
    if (typeof window !== 'undefined') {
      const naverMapsUrl = `https://map.naver.com/p/directions/-/-/-/walk/place/${weddingConfig.venue.placeId}?c=${weddingConfig.venue.mapZoom},0,0,0,dh`;
      window.open(naverMapsUrl, '_blank');
    }
  };

  const navigateToKakao = () => {
    if (typeof window !== 'undefined') {
      const lat = weddingConfig.venue.coordinates.latitude;
      const lng = weddingConfig.venue.coordinates.longitude;
      const name = encodeURIComponent(weddingConfig.venue.name);
      const kakaoMapsUrl = `https://map.kakao.com/link/to/${name},${lat},${lng}`;
      window.open(kakaoMapsUrl, '_blank');
    }
  };

  const navigateToTmap = () => {
    if (typeof window !== 'undefined') {
      const lat = weddingConfig.venue.coordinates.latitude;
      const lng = weddingConfig.venue.coordinates.longitude;
      const name = encodeURIComponent(weddingConfig.venue.name);

      // 모바일 디바이스에서는 앱 실행 시도
      window.location.href = `tmap://route?goalname=${name}&goaly=${lat}&goalx=${lng}`;

      // 앱 미설치 대비
      setTimeout(() => {
        if (document.hidden) return;
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

      {/* ✅ 지도 대신 약도 이미지 */}
      <MapImageContainer>
        <MapImage src="/images/map.png" alt="약도" />
      </MapImageContainer>

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
          <ShuttleCardHeader
            onClick={() => toggleShuttle('groom')}
            $isExpanded={expandedShuttle === 'groom'}
          >
            <CardTitle>신랑측 배차 안내</CardTitle>
            <ExpandIcon $isExpanded={expandedShuttle === 'groom'}>
              {expandedShuttle === 'groom' ? '−' : '+'}
            </ExpandIcon>
          </ShuttleCardHeader>

          {expandedShuttle === 'groom' && (
            <ShuttleContent>
              <ShuttleInfo>
                <ShuttleLabel>탑승 장소</ShuttleLabel>
                <ShuttleText>
                  {formatTextWithLineBreaks(weddingConfig.venue.groomShuttle.location)}
                </ShuttleText>
              </ShuttleInfo>
              <ShuttleInfo>
                <ShuttleLabel>출발 시간</ShuttleLabel>
                <ShuttleText>{weddingConfig.venue.groomShuttle.departureTime}</ShuttleText>
              </ShuttleInfo>
              <ShuttleInfo>
                <ShuttleLabel>인솔자</ShuttleLabel>
                <ShuttleText>
                  {weddingConfig.venue.groomShuttle.contact.name} (
                  {weddingConfig.venue.groomShuttle.contact.tel})
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
          <ShuttleCardHeader
            onClick={() => toggleShuttle('bride')}
            $isExpanded={expandedShuttle === 'bride'}
          >
            <CardTitle>신부측 배차 안내</CardTitle>
            <ExpandIcon $isExpanded={expandedShuttle === 'bride'}>
              {expandedShuttle === 'bride' ? '−' : '+'}
            </ExpandIcon>
          </ShuttleCardHeader>

          {expandedShuttle === 'bride' && (
            <ShuttleContent>
              <ShuttleInfo>
                <ShuttleLabel>탑승 장소</ShuttleLabel>
                <ShuttleText>
                  {formatTextWithLineBreaks(weddingConfig.venue.brideShuttle.location)}
                </ShuttleText>
              </ShuttleInfo>
              <ShuttleInfo>
                <ShuttleLabel>출발 시간</ShuttleLabel>
                <ShuttleText>{weddingConfig.venue.brideShuttle.departureTime}</ShuttleText>
              </ShuttleInfo>
              <ShuttleInfo>
                <ShuttleLabel>인솔자</ShuttleLabel>
                <ShuttleText>
                  {weddingConfig.venue.brideShuttle.contact.name} (
                  {weddingConfig.venue.brideShuttle.contact.tel})
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
  background-color: ${props => (props.$bgColor === 'beige' ? '#F8F6F2' : 'white')};
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

/* ✅ 약도 이미지 */
const MapImageContainer = styled.div`
  height: 16rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
  background-color: #f1f1f1;
`;

const MapImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background-color: #c4a986;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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
  border-bottom: ${props => (props.$isExpanded ? '1px solid #eee' : 'none')};

  h4 {
    margin: 0;
  }
`;

const ExpandIcon = styled.span<{ $isExpanded: boolean }>`
  font-size: 1.5rem;
  line-height: 1;
  color: var(--secondary-color);
`;

const ShuttleContent = styled.div`
  padding: 1rem 1.5rem 1.5rem;
`;

export default VenueSection;