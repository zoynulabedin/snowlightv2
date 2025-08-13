import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "ko" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Translation dictionaries
const translations = {
  ko: {
    // Navigation
    "nav.chart": "벅스차트",
    "nav.newest": "최신 음악",
    "nav.music4u": "뮤직4U",
    "nav.genre": "장르",
    "nav.posts": "뮤직포스트",
    "nav.pd_albums": "뮤직PD 앨범",
    "nav.reviews": "추천앨범 리뷰",
    "nav.by_year": "연도별",
    "nav.favorite": "Favorite",
    "nav.hearts": "하트 충전소",
    "nav.connect": "커넥트",
    "nav.radio": "라디오",

    // Header
    "header.search_placeholder": "검색어 입력",
    "header.login": "로그인 / 회원가입",
    "header.membership": "벅스 VIP 멤버십 안내",

    // Search
    "search.recent_searches": "최근 검색",
    "search.clear": "지우기",
    "search.no_results": "검색 결과가 없습니다",
    "search.try_different": "다른 키워드를 시도하거나 맞춤법을 확인하세요",
    "search.view_all": "모든 결과 보기",
    "search.songs": "곡",
    "search.albums": "앨범",
    "search.artists": "아티스트",
    "search.videos": "영상",
    "search.tracks": "트랙",
    "search.followers": "팔로워",
    "search.views": "조회수",

    // Home page
    "home.title": "음악이 필요한 순간, 벅스",
    "home.subtitle": "최신 음악과 인기 차트를 만나보세요",
    "home.view_chart": "벅스차트 보기",
    "home.latest_music": "최신 음악",
    "home.more": "더 보기",
    "home.all": "전체",
    "home.domestic": "국내",
    "home.international": "해외",
    "home.recommended_playlists": "추천 플레이리스트",
    "home.Snowlight_recommendation": "벅스 추천",

    // Chart page
    "chart.title": "벅스차트",
    "chart.song_chart": "곡 차트",
    "chart.realtime": "실시간",
    "chart.all_genres": "전체 장르",
    "chart.songs": "곡",
    "chart.albums": "앨범",
    "chart.music_pd_albums": "뮤직PD 앨범",
    "chart.videos": "영상",
    "chart.connect_songs": "커넥트 곡",
    "chart.connect_videos": "커넥트 영상",
    "chart.daily": "일간",
    "chart.weekly": "주간",
    "chart.based_on": "기준",
    "chart.select_all": "전체",
    "chart.play_selected": "선택된 곡 재생듣기",
    "chart.add_to_playlist": "재생목록에 추가",
    "chart.add_to_album": "내 앨범에 담기",
    "chart.download": "다운로드",
    "chart.rank": "순위",
    "chart.song": "곡",
    "chart.artist": "아티스트",
    "chart.actions": "듣기 재생목록 내앨범 다운 영상 기타",
    "chart.description":
      "벅스차트는 이용자들의 음악 감상 패턴을 분석하여 제공하는 차트입니다. 실시간 차트는 최근 1시간 동안의 이용 현황을 반영합니다.",
    "chart.calculation_info": "집계기간 내 듣기와 다운로드 수 합산하여 반영",

    // Album page
    "album.album": "앨범",
    "album.type": "유형",
    "album.genre": "장르",
    "album.style": "스타일",
    "album.release_date": "발매일",
    "album.distributor": "유통사",
    "album.label": "기획사",
    "album.duration": "재생 시간",
    "album.quality": "고음질",
    "album.purchase": "앨범구매",
    "album.like": "좋아",
    "album.comments": "개",
    "album.share": "공유",
    "album.tracks": "수록곡",
    "album.track_list_all": "곡 목록 전체",
    "album.play_all_add": "전체 듣기(재생목록 추가)",
    "album.play_all_replace": "전체 듣기(재생목록 교체)",
    "album.track_number": "번호",
    "album.track_info": "곡정보",
    "album.title_track": "[타이틀곡]",
    "album.flac_download": "flac 다운로드",
    "album.other_functions": "기타 기능",
    "album.description": "앨범 소개",
    "album.comments_section": "한마디",
    "album.comment_placeholder": "한마디 입력",
    "album.attach_music": "음악 첨부",
    "album.register": "등록",
    "album.no_comments":
      "등록된 한마디가 없습니다. 첫 번째 한마디를 남겨보세요!",

    // Authentication
    "auth.login": "로그인",
    "auth.signup": "회원가입",
    "auth.create_account": "새 계정 만들기",
    "auth.already_have_account": "이미 계정이 있으신가요?",
    "auth.login_here": "로그인하기",
    "auth.email": "이메일",
    "auth.password": "비밀번호",
    "auth.password_confirm": "비밀번호 확인",
    "auth.name": "이름",
    "auth.phone": "전화번호",
    "auth.remember_me": "로그인 상태 유지",
    "auth.forgot_password": "비밀번호를 잊으셨나요?",
    "auth.email_placeholder": "이메일을 입력하세요",
    "auth.password_placeholder": "비밀번호를 입력하세요",
    "auth.password_confirm_placeholder": "비밀번호를 다시 입력하세요",
    "auth.name_placeholder": "이름을 입력하세요",
    "auth.phone_placeholder": "전화번호를 입력하세요",
    "auth.agree_terms": "이용약관에 동의합니다.",
    "auth.agree_privacy": "개인정보처리방침에 동의합니다.",
    "auth.agree_marketing": "마케팅 정보 수신에 동의합니다. (선택)",
    "auth.view": "보기",
    "auth.logging_in": "로그인 중...",
    "auth.signing_up": "가입 중...",
    "auth.test_account": "테스트 계정: test@Snowlight.co.kr / password123",

    // Player
    "player.playlist": "재생목록",
    "player.tracks_count": "곡",
    "player.shuffle": "셔플",
    "player.repeat": "반복",
    "player.previous": "이전",
    "player.next": "다음",
    "player.play": "재생",
    "player.pause": "일시정지",
    "player.volume": "볼륨",
    "player.mute": "음소거",
    "player.download": "다운로드",
    "player.fullscreen": "전체화면",

    // Common
    "common.single": "싱글",
    "common.album": "정규",
    "common.mini_album": "EP(미니)",
    "common.compilation": "컴필레이션",
    "common.loading": "로딩 중...",
    "common.error": "오류가 발생했습니다",
    "common.close": "닫기",
    "common.cancel": "취소",
    "common.confirm": "확인",
    "common.save": "저장",
    "common.edit": "편집",
    "common.delete": "삭제",

    // Upload page
    "upload.title": "음악 및 비디오 업로드",
    "upload.description":
      "오디오 파일과 비디오 파일을 업로드하여 벅스에서 공유하세요",
    "upload.dropFiles": "파일을 여기에 드래그하거나 클릭하여 선택하세요",
    "upload.supportedFormats":
      "지원 형식: MP3, WAV, FLAC, AAC, MP4, AVI, MOV, WMV",
    "upload.maxSize": "최대 파일 크기: 오디오 100MB, 비디오 500MB",
    "upload.queue": "업로드 대기열",
    "upload.uploadAll": "모두 업로드",
    "upload.artist": "아티스트",
    "upload.album": "앨범",
    "upload.selectGenre": "장르 선택",
    "upload.upload": "업로드",
    "upload.success": "업로드가 완료되었습니다!",
    "upload.guidelines": "업로드 가이드라인",
    "upload.audioGuidelines": "오디오 파일",
    "upload.videoGuidelines": "비디오 파일",
    "upload.copyright": "저작권 안내",
    "upload.copyrightNotice":
      "업로드하는 모든 콘텐츠는 저작권을 소유하고 있거나 적절한 라이선스를 보유한 것이어야 합니다. 저작권을 침해하는 콘텐츠는 삭제될 수 있습니다.",

    // Signup page
    "signup.title": "벅스 회원가입",

    // Homepage sections
    "home.latest_albums": "최신 앨범",
    "home.view_more_albums": "최신 앨범 더 보기",
    "home.Snowlight_chart": "벅스차트",
    "home.view_more_chart": "벅스차트 더 보기",
    "home.latest_videos": "최신 영상",
    "home.view_more_videos": "최신 영상 더 보기",
    "home.music_posts": "뮤직포스트",
    "home.view_more_posts": "뮤직포스트 더 보기",

    // Footer
    "footer.customer_service": "고객센터",
    "footer.notices": "공지사항",
    "footer.events": "이벤트",
    "footer.Snowlight_panel": "벅스패널",
    "footer.Snowlight_tips": "벅스 꿀팁 보기",
    "footer.company_info": "회사정보",
    "footer.about": "회사소개",
    "footer.partnership": "제휴문의",
    "footer.terms": "이용약관",
    "footer.privacy": "개인정보처리방침",
    "footer.social_media": "소셜미디어",
    "footer.contact": "문의",
    "footer.copyright": "© 2025 NHN Snowlight Corp. All rights reserved.",

    // Layout specific
    "layout.favorite_2025": "Favorite · 2025 상반기",
    "layout.close_banner": "배너닫기",
    "layout.my_playlist": "나를 위한 플리",
    "layout.essential": "essential;",
    "layout.web_player": "웹 플레이어",
    "layout.Snowlight_player": "벅스 플레이어",
    "layout.customer_center": "고객센터",
    "layout.games": "게임",
    "layout.comico": "comico",
    "layout.ticketlink": "티켓링크",
    "layout.hangame": "HANGAME",
    "layout.hello_user": "안녕하세요, {name}님",
    "layout.logout": "로그아웃",
    "layout.login_signup": "로그인 / 회원가입",
    "layout.membership_guide": "벅스 VIP 멤버십 안내",
    "layout.purchase_ticket": "이용권 구매",
    "layout.register_voucher": "상품권 등록",
    "layout.credit_register": "신용권 등록",
    "layout.Snowlight_tv": "벅스TV",
    "layout.albums": "앨범",
    "layout.others": "기타",
    "layout.favorites": "즐겨찾기",
    "layout.genre_music": "장르",
    "layout.music4u": "뮤직4U",
    "layout.music_posts": "뮤직포스트",
    "layout.music_pd_albums": "뮤직PD 앨범",
    "layout.album_reviews": "추천앨범 리뷰",
    "layout.by_year": "연도별",
    "layout.upload": "업로드",
    "layout.fav": "Fav",
    "layout.heart_station": "하트 충전소",
    "layout.mypage": "마이페이지",
    "layout.connect": "커넥트",
    "layout.radio": "라디오",
    "layout.music_video": "뮤직비디오",
    "layout.live": "라이브",
    "layout.interview": "인터뷰",
    "layout.events": "이벤트",
    "layout.notices": "공지사항",
    "layout.social_media": "소셜 미디어",
    "layout.app_download": "벅스 앱 다운로드",
    "layout.services": "서비스",
    "layout.customer_support": "고객지원",
    "layout.company_info": "회사정보",
    "layout.vip_membership": "VIP 멤버십",
    "layout.faq": "FAQ",
    "layout.inquiry": "1:1 문의",
    "layout.phone_support": "고객센터: +447488818495",
    "layout.company_intro": "회사소개",
    "layout.terms": "이용약관",
    "layout.privacy": "개인정보처리방침",
    "layout.youth_policy": "청소년보호정책",
    "layout.footer_slogan": "음악이 필요한 순간, snowlight와 함께하세요.",
    "layout.footer_copyright":
      "© 2024 Snowlight Entertainment Ltd. All rights reserved.",

    // Membership page
    "membership.title": "snowlight VIP 멤버십",
    "membership.subtitle": "음악을 더 자유롭게, 더 특별하게",
    "membership.current_plan": "현재 이용중인 플랜",
    "membership.upgrade": "업그레이드",
    "membership.popular": "인기",
    "membership.per_month": "월",
    "membership.original_price": "정가",
    "membership.select_plan": "이 플랜 선택",
    "membership.payment_method": "결제 방법",
    "membership.credit_card": "신용카드",
    "membership.bank_transfer": "계좌이체",
    "membership.phone_payment": "휴대폰 결제",
    "membership.kakaopay": "카카오페이",
    "membership.paypal": "PayPal",
    "membership.proceed_payment": "결제하기",
    "membership.benefits": "멤버십 혜택",
    "membership.compare_plans": "플랜 비교",
    "membership.faq_title": "자주 묻는 질문",
    "membership.faq": "자주 묻는 질문",
    "membership.faq_cancellation": "언제든지 해지할 수 있나요?",
    "membership.faq_cancellation_answer":
      "네, 언제든지 해지하실 수 있습니다. 해지 후에도 현재 결제 기간이 끝날 때까지 VIP 혜택을 이용하실 수 있어요.",
    "membership.faq_hearts_usage": "하트는 어떻게 사용하나요?",
    "membership.faq_hearts_usage_answer":
      "하트는 음악 다운로드, 독점 콘텐츠 이용, 아티스트 응원 등에 사용할 수 있습니다. VIP 멤버는 매월 추가 하트를 받으실 수 있어요.",
    "membership.faq_plan_change": "플랜을 변경할 수 있나요?",
    "membership.faq_plan_change_answer":
      "네, 언제든지 더 높은 플랜으로 업그레이드하거나 낮은 플랜으로 다운그레이드하실 수 있습니다. 변경사항은 다음 결제일부터 적용됩니다.",
    "membership.faq_refund": "환불 정책이 어떻게 되나요?",
    "membership.faq_refund_answer":
      "구독 후 7일 이내에는 전액 환불이 가능하며, 이후에는 남은 기간에 대해 비례 환불해드립니다.",

    // Credits system
    "credits.hearts": "하트",
    "credits.current_hearts": "보유 하트",
    "credits.earn_hearts": "하트 획득",
    "credits.spend_hearts": "하트 사용",
    "credits.purchase_hearts": "하트 구매",
    "credits.daily_bonus": "일일 보너스",
    "credits.upload_bonus": "업로드 보너스",
    "credits.share_bonus": "공유 보너스",
    "credits.heart_packages": "하트 패키지",
    "credits.heart_history": "하트 내역",
    "credits.hearts_management": "하트 관리",
    "credits.hearts_added": "하트가 추가되었습니다!",
    "credits.insufficient_hearts": "하트가 부족합니다",
    "credits.hearts_spent": "하트를 사용했습니다",
  },
  en: {
    // Navigation
    "nav.chart": "Charts",
    "nav.newest": "New Music",
    "nav.music4u": "Music4U",
    "nav.genre": "Genres",
    "nav.posts": "Music Posts",
    "nav.pd_albums": "PD Albums",
    "nav.reviews": "Album Reviews",
    "nav.by_year": "By Year",
    "nav.favorite": "Favorite",
    "nav.hearts": "Hearts",
    "nav.connect": "Connect",
    "nav.radio": "Radio",

    // Header
    // "header.search_placeholder": "Search music, artists, albums...",
    // "header.login": "Login / Sign Up",
    // "header.membership": "Snowlight VIP Membership",

    // Search
    "search.recent_searches": "Recent Searches",
    "search.clear": "Clear",
    "search.no_results": "No results found",
    "search.try_different": "Try different keywords or check your spelling",
    "search.view_all": "View all results",
    "search.songs": "Songs",
    "search.albums": "Albums",
    "search.artists": "Artists",
    "search.videos": "Videos",
    "search.tracks": "tracks",
    "search.followers": "followers",
    "search.views": "views",

    // Home page
    "home.title": "Music for Every Moment, Snowlight",
    "home.subtitle": "Discover the latest music and popular charts",
    "home.view_chart": "View Charts",
    "home.latest_music": "New Music",
    "home.more": "View More",
    "home.all": "All",
    "home.domestic": "K-Pop",
    "home.international": "International",
    "home.recommended_playlists": "Recommended Playlists",
    "home.Snowlight_recommendation": "Snowlight Picks",

    // Chart page
    "chart.title": "Snowlight Chart",
    "chart.song_chart": "Song Chart",
    "chart.realtime": "Real-time",
    "chart.all_genres": "All Genres",
    "chart.songs": "Songs",
    "chart.albums": "Albums",
    "chart.music_pd_albums": "PD Albums",
    "chart.videos": "Videos",
    "chart.connect_songs": "Connect Songs",
    "chart.connect_videos": "Connect Videos",
    "chart.daily": "Daily",
    "chart.weekly": "Weekly",
    "chart.based_on": "as of",
    "chart.select_all": "Select All",
    "chart.play_selected": "Play Selected",
    "chart.add_to_playlist": "Add to Playlist",
    "chart.add_to_album": "Add to My Music",
    "chart.download": "Download",
    "chart.rank": "Rank",
    "chart.song": "Song",
    "chart.artist": "Artist",
    "chart.actions": "Play Playlist MyMusic Download Video More",
    "chart.description":
      "Snowlight Chart analyzes users' music listening patterns to provide charts. Real-time charts reflect usage over the past hour.",
    "chart.calculation_info":
      "Reflects combined listening and download counts during the collection period",

    // Album page
    "album.album": "Album",
    "album.type": "Type",
    "album.genre": "Genre",
    "album.style": "Style",
    "album.release_date": "Release Date",
    "album.distributor": "Distributor",
    "album.label": "Label",
    "album.duration": "Duration",
    "album.quality": "High Quality",
    "album.purchase": "Buy Album",
    "album.like": "Like",
    "album.comments": "Comments",
    "album.share": "Share",
    "album.tracks": "Tracks",
    "album.track_list_all": "All Tracks",
    "album.play_all_add": "Play All (Add to Playlist)",
    "album.play_all_replace": "Play All (Replace Playlist)",
    "album.track_number": "No.",
    "album.track_info": "Track Info",
    "album.title_track": "[Title Track]",
    "album.flac_download": "FLAC Download",
    "album.other_functions": "More Options",
    "album.description": "Album Description",
    "album.comments_section": "Comments",
    "album.comment_placeholder": "Write a comment",
    "album.attach_music": "Attach Music",
    "album.register": "Post",
    "album.no_comments": "No comments yet. Be the first to leave a comment!",

    // Authentication
    "auth.login": "Login",
    "login.title": "Snowlight Login",
    "auth.signup": "Sign Up",
    "auth.create_account": "Create new account",
    "auth.already_have_account": "Already have an account?",
    "auth.login_here": "Login here",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.password_confirm": "Confirm Password",
    "auth.name": "Name",
    "auth.phone": "Phone Number",
    "auth.remember_me": "Remember me",
    "auth.forgot_password": "Forgot your password?",
    "auth.email_placeholder": "Enter your email",
    "auth.password_placeholder": "Enter your password",
    "auth.password_confirm_placeholder": "Confirm your password",
    "auth.name_placeholder": "Enter your name",
    "auth.phone_placeholder": "Enter your phone number",
    "auth.agree_terms": "I agree to the Terms of Service.",
    "auth.agree_privacy": "I agree to the Privacy Policy.",
    "auth.agree_marketing":
      "I agree to receive marketing communications. (Optional)",
    "auth.view": "View",
    "auth.logging_in": "Logging in...",
    "auth.signing_up": "Signing up...",
    "auth.test_account": "Test account: test@Snowlight.co.kr / password123",

    // Player
    "player.playlist": "Playlist",
    "player.tracks_count": "tracks",
    "player.shuffle": "Shuffle",
    "player.repeat": "Repeat",
    "player.previous": "Previous",
    "player.next": "Next",
    "player.play": "Play",
    "player.pause": "Pause",
    "player.volume": "Volume",
    "player.mute": "Mute",
    "player.download": "Download",
    "player.fullscreen": "Fullscreen",

    // Common
    "common.single": "Single",
    "common.album": "Album",
    "common.mini_album": "EP",
    "common.compilation": "Compilation",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.close": "Close",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",

    // Upload page
    "upload.title": "Upload Music & Videos",
    "upload.description": "Upload audio and video files to share on Snowlight",
    "upload.dropFiles": "Drag files here or click to select",
    "upload.supportedFormats":
      "Supported formats: MP3, WAV, FLAC, AAC, MP4, AVI, MOV, WMV",
    "upload.maxSize": "Max file size: Audio 100MB, Video 500MB",
    "upload.queue": "Upload Queue",
    "upload.uploadAll": "Upload All",
    "upload.artist": "Artist",
    "upload.album": "Album",
    "upload.selectGenre": "Select Genre",
    "upload.upload": "Upload",
    "upload.success": "Upload completed successfully!",
    "upload.guidelines": "Upload Guidelines",
    "upload.audioGuidelines": "Audio Files",
    "upload.videoGuidelines": "Video Files",
    "upload.copyright": "Copyright Notice",
    "upload.copyrightNotice":
      "All uploaded content must be owned by you or you must have appropriate licenses. Content that infringes copyright may be removed.",

    // Signup page
    "signup.title": "Snowlight Sign Up",

    // Homepage sections
    "home.latest_albums": "New Albums",
    "home.view_more_albums": "View More Albums",
    "home.Snowlight_chart": "Snowlight Chart",
    "home.view_more_chart": "View More Chart",
    "home.latest_videos": "New Videos",
    "home.view_more_videos": "View More Videos",
    "home.music_posts": "Music Posts",
    "home.view_more_posts": "View More Posts",

    // Footer
    "footer.customer_service": "Customer Service",
    "footer.notices": "Notices",
    "footer.events": "Events",
    "footer.Snowlight_panel": "Snowlight Panel",
    "footer.Snowlight_tips": "Snowlight Tips",
    "footer.company_info": "Company Info",
    "footer.about": "About Us",
    "footer.partnership": "Partnership",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.social_media": "Social Media",
    "footer.contact": "Contact",
    "footer.copyright":
      "©2025 Snowlight Entertainment Ltd. All rights reserved.",

    // Layout specific
    "layout.favorite_2025": "Favorite · 2025 First Half",
    "layout.close_banner": "Close Banner",
    "layout.my_playlist": "My Playlist",
    "layout.essential": "essential;",
    "layout.web_player": "Web Player",
    "layout.Snowlight_player": "Snowlight Player",
    "layout.customer_center": "Customer Center",
    "layout.games": "Games",
    "layout.comico": "comico",
    "layout.ticketlink": "TicketLink",
    "layout.hangame": "HANGAME",
    "layout.hello_user": "Hello, {name}!",
    "layout.logout": "Logout",
    "layout.dashboard": "Dashboard",
    "layout.login_signup": "Login / Sign Up",
    "layout.membership_guide": "Snowlight VIP Membership",
    "layout.purchase_ticket": "Buy Pass",
    "layout.register_voucher": "Redeem Gift Card",
    "layout.credit_register": "Add Credits",
    "layout.Snowlight_tv": "Snowlight TV",
    "layout.albums": "Albums",
    "layout.others": "Others",
    "layout.favorites": "Favorites",
    "layout.genre_music": "Genres",
    "layout.music4u": "Music4U",
    "layout.music_posts": "Music Posts",
    "layout.music_pd_albums": "PD Albums",
    "layout.album_reviews": "Album Reviews",
    "layout.by_year": "By Year",
    "layout.upload": "Upload",
    "layout.fav": "Fav",
    "layout.heart_station": "Heart Station",
    "layout.mypage": "My Page",
    "layout.connect": "Connect",
    "layout.radio": "Radio",
    "layout.music_video": "Music Videos",
    "layout.live": "Live",
    "layout.interview": "Interviews",
    "layout.events": "Events",
    "layout.notices": "Notices",
    "layout.social_media": "Social Media",
    "layout.app_download": "Download Snowlight App",
    "layout.services": "Services",
    "layout.customer_support": "Customer Support",
    "layout.company_info": "Company Info",
    "layout.vip_membership": "VIP Membership",
    "layout.faq": "FAQ",
    "layout.inquiry": "1:1 Inquiry",
    "layout.phone_support": "Customer Center: +447488818495",
    "layout.company_intro": "About Us",
    "layout.terms": "Terms of Service",
    "layout.privacy": "Privacy Policy",
    "layout.youth_policy": "Youth Protection Policy",
    "layout.footer_slogan": "Music for Every Moment, with Snowlight.",
    "layout.footer_copyright":
      "©2025 Snowlight Entertainment Ltd. All rights reserved.",

    // Membership page
    "membership.title": "Snowlight VIP Membership",
    "membership.subtitle": "Music More Freely, More Specially",
    "membership.current_plan": "Current Plan",
    "membership.upgrade": "Upgrade",
    "membership.popular": "Popular",
    "membership.per_month": "month",
    "membership.original_price": "Original Price",
    "membership.select_plan": "Select This Plan",
    "membership.payment_method": "Payment Method",
    "membership.credit_card": "Credit Card",
    "membership.bank_transfer": "Bank Transfer",
    "membership.phone_payment": "Mobile Payment",
    "membership.kakaopay": "KakaoPay",
    "membership.paypal": "PayPal",
    "membership.proceed_payment": "Proceed to Payment",
    "membership.benefits": "Membership Benefits",
    "membership.compare_plans": "Compare Plans",
    "membership.faq_title": "Frequently Asked Questions",
    "membership.faq": "Frequently Asked Questions",
    "membership.faq_cancellation": "Can I cancel anytime?",
    "membership.faq_cancellation_answer":
      "Yes, you can cancel anytime. You'll continue to enjoy VIP benefits until the end of your current billing period after cancellation.",
    "membership.faq_hearts_usage": "How do I use hearts?",
    "membership.faq_hearts_usage_answer":
      "Hearts can be used for music downloads, accessing exclusive content, supporting artists, and more. VIP members receive additional hearts every month.",
    "membership.faq_plan_change": "Can I change my plan?",
    "membership.faq_plan_change_answer":
      "Yes, you can upgrade or downgrade to any plan at any time. Changes will take effect from your next billing cycle.",
    "membership.faq_refund": "What's the refund policy?",
    "membership.faq_refund_answer":
      "Full refund is available within 7 days of subscription. After that, we offer prorated refunds for the remaining period.",

    // Credits system
    "credits.hearts": "Hearts",
    "credits.current_hearts": "Current Hearts",
    "credits.earn_hearts": "Earn Hearts",
    "credits.spend_hearts": "Spend Hearts",
    "credits.purchase_hearts": "Purchase Hearts",
    "credits.daily_bonus": "Daily Bonus",
    "credits.upload_bonus": "Upload Bonus",
    "credits.share_bonus": "Share Bonus",
    "credits.heart_packages": "Heart Packages",
    "credits.heart_history": "Heart History",
    "credits.hearts_management": "Hearts Management",
    "credits.hearts_added": "Hearts added!",
    "credits.insufficient_hearts": "Insufficient hearts",
    "credits.hearts_spent": "Hearts spent",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get language from localStorage on client side
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("Snowlight-language");
      return (saved as Language) || "ko";
    }
    return "ko";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("Snowlight-language", lang);
    }
  };

  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    );
  };

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
