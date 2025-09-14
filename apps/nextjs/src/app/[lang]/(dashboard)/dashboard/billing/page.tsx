// 极其简化的计费页面，完全不依赖外部组件或服务
export const metadata = {
  title: "Billing",
  description: "Manage billing and your subscription plan.",
};

export default function BillingPage() {
  // 不使用任何动态数据或外部依赖
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Billing</h1>
      <p style={{ color: '#666' }}>Manage your subscription and billing information.</p>
      
      <div style={{ marginTop: '2rem', border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Subscription</h2>
        <p>Demo Plan - Valid until 30 days from now</p>
      </div>
      
      <div style={{ marginTop: '1rem', border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Usage</h2>
        <p>No usage data available</p>
      </div>
    </div>
  );
}
