import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import './Dashboard.css';

function Dashboard() {
    return (
        <div className="dashboard-page">
            <Navbar />
            <div className="dashboard-content">
                <h1 className="dashboard-title">Welcome to your dashboard!</h1>
                <p className="dashboard-text">This is where you can manage your profile, view your bookings, and connect with guides.</p>
            </div>  
            <Footer />
        </div>
    );
}