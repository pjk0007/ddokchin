import useConnection from './connect/useConnection';
import './App.css';

function App() {
  const { isActive, off, on } = useConnection();
  return (
    <div className="App">
      <header>
        <h1>똑친</h1>
      </header>
      <main>
        <button
          onClick={() => (isActive ? off() : on())}
          className={`btn ${isActive ? 'active' : ''}`}
        >
          {isActive ? '연결 끊기' : '연결하기'}
        </button>
        <h3>똑친과 자유롭게 대화해보세요!</h3>
        <section>
          <h4>아래 기능도 사용해보세요!</h4>
          <p>- 배경색을 원하는 색으로 바꾸기</p>
          <p>- 글자색을 원하는 색으로 바꾸기</p>
        </section>
      </main>
      <div></div>
      <footer>
        <p>
          <a
            href="https://github.com/craigsdennis/talk-to-javascript-openai-workers?tab=readme-ov-file"
            target="_blank"
            rel="noreferrer"
          >
            예제 코드
          </a>{' '}
          참고
          <br />
          <a
            href="https://platform.openai.com/docs/api-reference/realtime"
            target="_blank"
            rel="noreferrer"
          >
            OpenAI Realtime API
          </a>{' '}
          바로가기
        </p>
      </footer>
    </div>
  );
}

export default App;
