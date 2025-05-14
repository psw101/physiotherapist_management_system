use physiotherapist_management_system;


-- Insert 20 dummy patient records
INSERT INTO Patient (name, username, password, age, contactNumber, email, area, nic, address, createdAt, updatedAt)
VALUES 
('John Smith', 'johnsmith', 'Password123', 45, '0712345678', 'john.smith@email.com', 'Colombo', '884563218V', '123 Main Street, Colombo 05', NOW(), NOW()),
('Sarah Johnson', 'sarahj', 'Password456', 32, '0776543210', 'sarah.johnson@email.com', 'Kandy', '905678123V', '45 Temple Road, Kandy', NOW(), NOW()),
('Michael Wong', 'michaelw', 'Password789', 56, '0754321098', 'michael.wong@email.com', 'Galle', '754321098V', '67 Beach Road, Galle', NOW(), NOW()),
('Priya Silva', 'priyas', 'Password123', 29, '0778901234', 'priya.silva@email.com', 'Negombo', '923456789V', '89 Ocean View, Negombo', NOW(), NOW()),
('David Perera', 'davidp', 'Password456', 41, '0723456789', 'david.perera@email.com', 'Jaffna', '864531278V', '12 Northern Lane, Jaffna', NOW(), NOW()),
('Lakshmi Nair', 'lakshn', 'Password789', 35, '0765432109', 'lakshmi.nair@email.com', 'Batticaloa', '895674123V', '34 Eastern Road, Batticaloa', NOW(), NOW()),
('Robert Fernando', 'robertf', 'Password123', 62, '0712345670', 'robert.fernando@email.com', 'Matara', '714532189V', '56 Southern Avenue, Matara', NOW(), NOW()),
('Nisha Gupta', 'nishag', 'Password456', 27, '0778765432', 'nisha.gupta@email.com', 'Kurunegala', '945678912V', '78 Hill Street, Kurunegala', NOW(), NOW()),
('Ashan Perera', 'ashanp', 'Password789', 38, '0754321090', 'ashan.perera@email.com', 'Anuradhapura', '865432178V', '90 Ancient City Road, Anuradhapura', NOW(), NOW()),
('Emma Wilson', 'emmaw', 'Password123', 30, '0778901235', 'emma.wilson@email.com', 'Gampaha', '925678341V', '21 Green Lane, Gampaha', NOW(), NOW()),
('Samantha Lee', 'samanthal', 'Password456', 44, '0723456788', 'samantha.lee@email.com', 'Trincomalee', '784563219V', '43 Harbor Road, Trincomalee', NOW(), NOW()),
('Rajiv Kumar', 'rajivk', 'Password789', 51, '0765432108', 'rajiv.kumar@email.com', 'Ratnapura', '764532198V', '65 Gem City Lane, Ratnapura', NOW(), NOW()),
('Tharini De Silva', 'tharini', 'Password123', 33, '0712345671', 'tharini.desilva@email.com', 'Badulla', '905632147V', '87 Hill Country Road, Badulla', NOW(), NOW()),
('William James', 'williamj', 'Password456', 48, '0778765431', 'william.james@email.com', 'Nuwara Eliya', '785674123V', '109 Tea Estate Road, Nuwara Eliya', NOW(), NOW()),
('Malini Jayawardena', 'malinij', 'Password789', 36, '0754321091', 'malini.jaya@email.com', 'Polonnaruwa', '895643217V', '231 Ancient Kingdom Road, Polonnaruwa', NOW(), NOW()),
('Hassan Ahmed', 'hassana', 'Password123', 42, '0778901236', 'hassan.ahmed@email.com', 'Kalmunai', '834567219V', '45 East Coast Road, Kalmunai', NOW(), NOW()),
('Jennifer Lopez', 'jenniferl', 'Password456', 39, '0723456787', 'jennifer.lopez@email.com', 'Matale', '865432197V', '67 Central Hills Road, Matale', NOW(), NOW()),
('Kumar Sangakkara', 'kumars', 'Password789', 45, '0765432107', 'kumar.sangakkara@email.com', 'Hambantota', '794563218V', '89 Cricket Lane, Hambantota', NOW(), NOW()),
('Amaya Fonseka', 'amayaf', 'Password123', 28, '0712345672', 'amaya.fonseka@email.com', 'Dehiwala', '945672318V', '101 Coastal Road, Dehiwala', NOW(), NOW()),
('Daniel Carter', 'danielc', 'Password456', 53, '0778765430', 'daniel.carter@email.com', 'Mount Lavinia', '754321987V', '123 Beach Front Avenue, Mount Lavinia', NOW(), NOW());