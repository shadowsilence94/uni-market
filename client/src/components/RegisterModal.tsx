import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nationality: '',
    profile_picture: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profile_picture: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const nationalities = [
    'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Argentine', 'Armenian', 'Australian', 'Austrian',
    'Azerbaijani', 'Bahamian', 'Bahraini', 'Bangladeshi', 'Barbadian', 'Belarusian', 'Belgian', 'Belizean', 'Beninese',
    'Bhutanese', 'Bolivian', 'Bosnian', 'Brazilian', 'British', 'Bruneian', 'Bulgarian', 'Burkinabe', 'Burmese', 'Burundian',
    'Cambodian', 'Cameroonian', 'Canadian', 'Cape Verdean', 'Central African', 'Chadian', 'Chilean', 'Chinese', 'Colombian',
    'Comoran', 'Congolese', 'Costa Rican', 'Croatian', 'Cuban', 'Cypriot', 'Czech', 'Danish', 'Djiboutian', 'Dominican',
    'Dutch', 'East Timorese', 'Ecuadorean', 'Egyptian', 'Emirian', 'Equatorial Guinean', 'Eritrean', 'Estonian', 'Ethiopian',
    'Fijian', 'Filipino', 'Finnish', 'French', 'Gabonese', 'Gambian', 'Georgian', 'German', 'Ghanaian', 'Greek', 'Grenadian',
    'Guatemalan', 'Guinea-Bissauan', 'Guinean', 'Guyanese', 'Haitian', 'Herzegovinian', 'Honduran', 'Hungarian', 'Icelander',
    'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian', 'Ivorian', 'Jamaican', 'Japanese', 'Jordanian',
    'Kazakhstani', 'Kenyan', 'Kittian and Nevisian', 'Kuwaiti', 'Kyrgyz', 'Laotian', 'Latvian', 'Lebanese', 'Liberian',
    'Libyan', 'Liechtensteiner', 'Lithuanian', 'Luxembourgish', 'Macedonian', 'Malagasy', 'Malawian', 'Malaysian', 'Maldivan',
    'Malian', 'Maltese', 'Marshallese', 'Mauritanian', 'Mauritian', 'Mexican', 'Micronesian', 'Moldovan', 'Monacan',
    'Mongolian', 'Moroccan', 'Mosotho', 'Motswana', 'Mozambican', 'Myanmar', 'Namibian', 'Nauruan', 'Nepalese', 'New Zealander',
    'Nicaraguan', 'Nigerian', 'Nigerien', 'North Korean', 'Norwegian', 'Omani', 'Pakistani', 'Palauan', 'Panamanian',
    'Papua New Guinean', 'Paraguayan', 'Peruvian', 'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian', 'Rwandan',
    'Saint Lucian', 'Salvadoran', 'Samoan', 'San Marinese', 'Sao Tomean', 'Saudi', 'Scottish', 'Senegalese', 'Serbian',
    'Seychellois', 'Sierra Leonean', 'Singaporean', 'Slovakian', 'Slovenian', 'Solomon Islander', 'Somali', 'South African',
    'South Korean', 'Spanish', 'Sri Lankan', 'Sudanese', 'Surinamer', 'Swazi', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese',
    'Tajik', 'Tanzanian', 'Thai', 'Togolese', 'Tongan', 'Trinidadian or Tobagonian', 'Tunisian', 'Turkish', 'Tuvaluan',
    'Ugandan', 'Ukrainian', 'Uruguayan', 'Uzbekistani', 'Venezuelan', 'Vietnamese', 'Welsh', 'Yemenite', 'Zambian', 'Zimbabwean'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        nationality: formData.nationality,
        profile_picture: formData.profile_picture
      });
      onClose();
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        nationality: '',
        profile_picture: ''
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <div className="flex justify-between items-center mb-4">
            <h2>Join Uni-Market</h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}
            >
              ×
            </button>
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Use @ait.asia email for AIT certification
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="nationality" className="form-label">
                Nationality
              </label>
              <select
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select your nationality</option>
                {nationalities.map((nationality) => (
                  <option key={nationality} value={nationality}>
                    {nationality}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="profile_picture" className="form-label">
                Profile Picture
              </label>
              {formData.profile_picture && (
                <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
                  <img 
                    src={formData.profile_picture} 
                    alt="Preview" 
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto' }}
                  />
                </div>
              )}
              <input
                type="file"
                id="profile_picture"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input"
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Optional: Upload a profile picture
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center">
            <p style={{ color: '#6b7280' }}>
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                style={{ background: 'none', border: 'none', color: '#1a5f3f', fontWeight: '500', cursor: 'pointer' }}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
