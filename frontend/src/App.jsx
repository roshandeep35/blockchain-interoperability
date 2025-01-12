import './App.css';
import TransferPage from './components/transferPage.jsx';
import ContractAnalyzer from './components/analyser.jsx';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<TransferPage />} />
        <Route path='/slither' element={<ContractAnalyzer />} />
      </Routes>
    </div>
  );
}
export default App;
