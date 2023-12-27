import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from "./component/login";
import Home from "./component/Home";
import {Navigation} from './component/navigation';
import {Logout} from './component/logout';
import MapFinder from "./pages/MapFinder";
import News from "./pages/News"

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
        </Routes>
    </BrowserRouter>;
}

export default App;