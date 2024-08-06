const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config');
const bcrypt = require('bcryptjs');

class User extends Model {
    // Method to validate a password
    async validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }
}

User.init({
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'User',
    hooks: {
        // Hash password before saving user
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

// Sync with database
sequelize.sync()
  .then(() => console.log('User table created'))
  .catch(err => console.log('Error: ' + err));

module.exports = User;
