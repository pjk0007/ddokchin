import useConnection from './connect/useConnection';
import './App.css';
import { useEffect, useState } from 'react';

const pricePerMillion = {
  '입력 Text': 0.6,
  '입력 Audio': 10,
  캐시: 0.3,
  '출력 Text': 2.4,
  '출력 Audio': 20,
};

function App() {
  const {
    isActive,
    off,
    on,
    recentInputTextTokens,
    recentInputAudioTokens,
    recentCacheTokens,
    recentOutputTextTokens,
    recentOutputAudioTokens,
    totalInputTextTokens,
    totalInputAudioTokens,
    totalCacheTokens,
    totalOutputTextTokens,
    totalOutputAudioTokens,
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
          <p>- 배경색 바꿔달라고 요청해보세요</p>
          <p>- 글자색 바꿔달라고 요청해보세요</p>
        </section>

        <table className="tokens">
          <thead>
            <tr>
              <th>항목</th>
              <th>
                최근
                <br />
                (Tkns)
              </th>
              <th>
                총
                <br />
                (Tkns)
              </th>
              <th>
                비용
                <br />
                ($)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                입력
                <br />
                Text
              </td>
              <td>{recentInputTextTokens}</td>
              <td>{totalInputTextTokens}</td>
              <td>{((totalInputTextTokens * 0.6) / 1000000).toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                입력
                <br />
                Audio
              </td>
              <td>{recentInputAudioTokens}</td>
              <td>{totalInputAudioTokens}</td>
              <td>{((totalInputAudioTokens * 10) / 1000000).toFixed(2)}</td>
            </tr>

            <tr>
              <td>캐시</td>
              <td>{recentCacheTokens}</td>
              <td>{totalCacheTokens}</td>
              <td>{((totalCacheTokens * 0.3) / 1000000).toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                출력
                <br />
                Text
              </td>
              <td>{recentOutputTextTokens}</td>
              <td>{totalOutputTextTokens}</td>
              <td>{((totalOutputTextTokens * 2.4) / 1000000).toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                출력
                <br />
                Audio
              </td>
              <td>{recentOutputAudioTokens}</td>
              <td>{totalOutputAudioTokens}</td>
              <td>{((totalOutputAudioTokens * 20) / 1000000).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <h4 className="total-cost">
          총 비용: $
          {(
            (totalInputTextTokens * 0.6 +
              totalInputAudioTokens * 10 +
              totalCacheTokens * 0.3 +
              totalOutputTextTokens * 2.4 +
              totalOutputAudioTokens * 20) /
            1000000
          ).toFixed(2)}
        </h4>

        <ul>
          <h4>100만 토큰당 가격</h4>
          {Object.entries(pricePerMillion).map(([key, value]) => (
            <li key={key}>
              {key}: ${value}
            </li>
          ))}
        </ul>
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
