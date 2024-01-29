import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
// import Login from "./component/login";
import Login from "./pages/Login";
import Home from "./component/Home";
import {Navigation} from './component/navigation';
import {Logout} from './component/logout';
import MapFinder from "./pages/MapFinder";
import News from "./pages/News"
import Article from "./pages/Article"
import MyAccount from "./pages/MyAccount"
import Park from './pages/Park';
import CreateLot from './pages/CreateLot';

// <Navbar/>

function App() {
    return <BrowserRouter>
    <Navigation></Navigation>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/map-finder" element={<MapFinder/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/logout" element={<Logout/>}/>
            <Route path="/news" element={<News/>}/>
            <Route path="/news/article" element={<Article/>}/>
            <Route path="/account" element={<MyAccount/>}/>
            <Route path="/park-view" element={<Park/>}/>
            <Route path="/create-lot" element={<CreateLot/>}/>
        </Routes>
    </BrowserRouter>;
}

export default App;