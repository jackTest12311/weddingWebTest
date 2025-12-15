import { NextResponse } from 'next/server';
import { weddingConfig } from '../../../src/config/wedding-config';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, side, isAttending, guestCount, hasMeal, timestamp } = data;
    
    // 슬랙 메시지를 더 간결하게 구성
    const slackMessage: any = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "💌 새로운 참석 여부 응답",
            emoji: true
          }
        },
        {
          type: "divider"
        }
      ]
    };

    // 기본 정보를 한 블록에 표시
    slackMessage.blocks.push({
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*이름:* ${name} (${side || '미지정'})`
        },
        {
          type: "mrkdwn",
          text: `*참석 여부:* ${isAttending ? '✅ 참석' : '❌ 불참'}`
        }
      ]
    });
    
    // 참석하는 경우만 인원 정보와 식사 여부 추가 (한 블록에 함께 표시)
    if (isAttending) {
      const additionalFields = [
        {
          type: "mrkdwn",
          text: `*참석 인원:* ${guestCount}명`
        }
      ];
      
      // 식사 여부 옵션이 활성화된 경우에만 표시
      if (weddingConfig.rsvp.showMealOption) {
        additionalFields.push({
          type: "mrkdwn",
          text: `*식사 여부:* ${hasMeal ? '✅ 식사 함' : '❌ 식사 안 함'}`
        });
      }
      
      slackMessage.blocks.push({
        type: "section",
        fields: additionalFields
      });
    }
    
    // 접수 시간을 직접 한국 시간으로 포맷팅
    const koreanTime = timestamp ? new Date(timestamp) : new Date();
    const koreanTimeString = koreanTime.toLocaleString('ko-KR', { 
      timeZone: 'Asia/Seoul',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false
    });
    
    // 날짜 정보 추가
    slackMessage.blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `접수 시간: ${koreanTimeString} (KST)`
        }
      ]
    });
    
    // 웹훅 URL이 제공된 경우에만 Slack으로 메시지 전송
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

if (!webhookUrl) {
  console.log('Slack 웹훅 URL이 설정되지 않았습니다. (SLACK_WEBHOOK_URL)');
  return NextResponse.json({ success: true });
}

await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(slackMessage),
});
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('RSVP 처리 오류:', error);
    return NextResponse.json({ 
      success: false,
      message: 'RSVP 처리 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 