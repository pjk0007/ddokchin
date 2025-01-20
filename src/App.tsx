import useConnection from './connect/useConnection';
import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const {
    isActive,
    off,
    on,
    recentInputTokens,
    recentCacheTokens,
    recentOutputTokens,
    totalInputTokens,
    totalCacheTokens,
    totalOutputTokens,
    isLoading,
    setIsLoading,
  } = useConnection();

  const [time, setTime] = useState(0);

  function startTimer() {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
    return () => clearInterval(interval);
  }

  function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  }

  function resetTimer() {
    setTime(0);
  }

  useEffect(() => {
    if (isActive) {
      return startTimer();
    }
  }, [isActive]);

  return (
    <div className="App">
      <header>
        <h1 className="title">똑친</h1>
        <button
          disabled={isLoading}
          onClick={() => {
            if (isLoading) return;
            if (isActive) {
              resetTimer();
              off();
            } else {
              on(setIsLoading);
            }
          }}
          className={`btn ${isActive ? 'active' : ''}`}
        >
          {isLoading ? '연결중..' : isActive ? '연결 끊기' : '연결하기'}
        </button>
        <p className="timer">{formatTime(time)}</p>
      </header>
      <main className="content">
        <h3 className="subtitle">똑친과 자유롭게 대화해보세요!</h3>
        <section className="chat">
          <h4 className="chat-title">아래 기능도 사용해보세요!</h4>
          <p>- 배경색을 원하는 색으로 바꾸기</p>
          <p>- 글자색을 원하는 색으로 바꾸기</p>
        </section>
        <table className="tokens">
          <thead>
            <tr>
              <th>항목</th>
              <th>입력</th>
              <th>캐시</th>
              <th>출력</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>최근 사용(tkn)</td>
              <td>{recentInputTokens}</td>
              <td>{recentCacheTokens}</td>
              <td>{recentOutputTokens}</td>
            </tr>
            <tr>
              <td>총 사용(tkn)</td>
              <td>{totalInputTokens}</td>
              <td>{totalCacheTokens}</td>
              <td>{totalOutputTokens}</td>
            </tr>
            <tr>
              <td>비용($)</td>
              <td>{(totalInputTokens * 5) / 1000000}</td>
              <td>{(totalCacheTokens * 2.5) / 1000000}</td>
              <td>{(totalOutputTokens * 20) / 1000000}</td>
            </tr>
          </tbody>
        </table>
        <h4>
          총 비용: $
          {(
            (totalInputTokens * 5 +
              totalCacheTokens * 2.5 +
              totalOutputTokens * 20) /
            1000000
          ).toFixed(2)}
        </h4>
      </main>
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
