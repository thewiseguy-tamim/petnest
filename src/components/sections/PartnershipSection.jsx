import React from 'react';

const partners = [
  {
    name: 'ASPCA',
    logo: 'https://logos-world.net/wp-content/uploads/2023/08/ASPCA-Logo.jpg',
    url: 'https://www.aspca.org/',
  },
  {
    name: 'Petfinder',
    logo: 'https://vectorseek.com/wp-content/uploads/2023/12/Petfinder-Logo-Vector.svg-.png',
    url: 'https://www.petfinder.com/',
  },
  {
    name: 'Best Friends Animal Society',
    logo: 'https://bootflare.com/wp-content/uploads/2023/02/Best-Friends-Animal-Society.png',
    url: 'https://bestfriends.org/',
  },
  {
    name: 'Humane Society',
    logo: 'https://www.iwmc.org/wp-content/uploads/2021/05/1200px-Humane_Society_of_the_United_States_Logo.svg_-768x574.png',
    url: 'https://www.humanesociety.org/',
  },
  {
    name: 'PetSmart Charities',
    logo: 'https://pet-insight.com/wp-content/uploads/2022/07/petsmart-charities-logo-vector.png',
    url: 'https://www.petsmartcharities.org/',
  },
];

const PartnershipSlider = () => {
  const containerStyle = {
    width: '100%',
    background: '#FAFAF5',
    padding: '2rem 0',
    textAlign: 'center',
  };

  const headingStyle = {
    fontSize: '1.8rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#333',
  };

  const sliderStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4rem',
    flexWrap: 'wrap',
  };

  const logoStyle = {
    height: '100px',
    transition: 'transform 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Partnerships</h2>
      <div style={sliderStyle}>
        {partners.map((partner, index) => (
          <a
            key={index}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={partner.logo}
              alt={partner.name}
              style={logoStyle}
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default PartnershipSlider;