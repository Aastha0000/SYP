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
  latitude DECIMAL(10,8) NULL,
  longitude DECIMAL(11,8) NULL,
  location_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
  amount DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'NPR',
  stripe_payment_intent_id VARCHAR(255),
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

CREATE TABLE IF NOT EXISTS location_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id INT NOT NULL,
  target_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id),
  FOREIGN KEY (target_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  destination_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, destination_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);
