// 在浏览器控制台运行此脚本来诊断问题

console.log('=== 诊断开始 ===');

console.log('\n1. React 检查:');
console.log('  - window.React:', typeof window.React);
console.log('  - window.ReactDOM:', typeof window.ReactDOM);

console.log('\n2. TimerBackend 检查:');
console.log('  - window.TimerBackend:', !!window.TimerBackend);
console.log('  - window.TimerBackendReady:', window.TimerBackendReady);
console.log('  - window.TimerBackendError:', window.TimerBackendError);

console.log('\n3. Dependencies 检查:');
console.log('  - window.LucideIcons:', !!window.LucideIcons);
console.log('  - window.GoogleGenerativeAI:', !!window.GoogleGenerativeAI);
console.log('  - window.DependenciesReady:', window.DependenciesReady);
console.log('  - window.DependenciesError:', window.DependenciesError);

console.log('\n4. DOM 检查:');
console.log('  - root element:', !!document.getElementById('root'));
console.log('  - root innerHTML length:', document.getElementById('root')?.innerHTML.length);

console.log('\n=== 诊断完成 ===');
