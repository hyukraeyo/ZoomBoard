// 임시 스크립트: 더미 계정 삭제용
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://wheludimqxsytugbqnna.supabase.co";
// Service Role Key가 필요합니다 (Admin 권한)
// Supabase Dashboard -> Settings -> API -> service_role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.log("SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.");
  console.log(
    "Supabase Dashboard -> Settings -> API -> service_role (secret) 에서 확인하세요."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function deleteTestUsers() {
  // 모든 사용자 목록 조회
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("사용자 목록 조회 실패:", error);
    return;
  }

  console.log(`총 ${users.users.length}명의 사용자 발견`);

  // zoomboard.app 또는 zoomboard.local 도메인 사용자 필터링
  const testUsers = users.users.filter(
    (u) =>
      u.email?.includes("@id.zoomboard.app") ||
      u.email?.includes("@zoomboard.local")
  );

  console.log(`삭제 대상: ${testUsers.length}명`);

  for (const user of testUsers) {
    console.log(`삭제 중: ${user.email}`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      user.id
    );
    if (deleteError) {
      console.error(`  실패: ${deleteError.message}`);
    } else {
      console.log(`  완료!`);
    }
  }

  console.log("정리 완료!");
}

deleteTestUsers();
