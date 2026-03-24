CREATE DATABASE IF NOT EXISTS paryatan_nepal;
USE paryatan_nepal;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'guide') NOT NULL DEFAULT 'user',
  full_name VARCHAR(150),
  languages_spoken TEXT,
  specialities TEXT,
  portfolio_url VARCHAR(255),
  profile_picture VARCHAR(255),
  licence_cert VARCHAR(255),
  is_verified BOOLEAN DEFAULT TRUE,
  verification_status ENUM('pending','verified','rejected') DEFAULT 'pending',
  gender ENUM('Male','Female','Other','Prefer not to say') DEFAULT NULL,
  earnings DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS destinations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  altitude_range VARCHAR(255),
  trekking_complexity VARCHAR(255),
  duration VARCHAR(255),
  price_range VARCHAR(255),
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guide_id INT NOT NULL,
  user_id INT NOT NULL,
  booking_date DATE NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guide_id) REFERENCES users(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);
