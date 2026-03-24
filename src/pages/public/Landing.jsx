import { useRef } from "react";
import "./Landing.css";
import heroImg from "../../assets/hero.png";
import aboutImg from "../../assets/Aboutus.jpeg";
import verifiedImg from "../../assets/FVerifiedAccounts.jpeg";
import UnifiedDImg from "../../assets/Funifieddashboard.jpeg";
import SmartcImg from "../../assets/Fsmartc.jpeg";
import ItembImg from "../../assets/Fitemb.jpeg";
import ImpactrImg from "../../assets/Fimpactr.jpeg";

const Landing = () => {
  const carouselRef = useRef(null);

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-left">
          <h1>
            Where Every Contribution <br /> Creates Change
          </h1>

          <p>
            A trusted platform connecting verified causes with
            meaningful support.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Add School</button>
            <button className="primary-btn">Donate Now</button>
            <button className="primary-btn">Add Campaign</button>
          </div>
        </div>

        <div className="hero-right">
          <img src={heroImg} alt="Social Impact" className="hero-image" />
        </div>
      </section>

      {/* FEATURES / IMPACT MODULES */}
      <section className="features" id="features">
        <h1>Our Impact Modules</h1>

        <div className="feature-wrapper">
          <button
            className="arrow"
            onClick={() =>
              carouselRef.current.scrollBy({ left: -360, behavior: "smooth" })
            }
          >
            &#10094;
          </button>
<div className="feature-carousel" ref={carouselRef}>
            {[
              {
                title: "Verified Accounts",
                text: "Ensures every user and organization is carefully verified, building a safe and trustworthy environment for donations and support.",
                image: verifiedImg,
              },
              {
                title: "Smart Campaigns",
                text: "Easily create, manage, and track campaigns with intuitive tools designed to maximize reach and impact..",
                image: SmartcImg,
              },
              {
                title: "Unified Dashboard",
                text: "Get a complete overview of donations, progress, and impact all in one organized and easy-to-use dashboard..",
                image: UnifiedDImg,
              },
              {
                title: "Item-Based Giving",
                text: "Donate specific items directly to those in need, ensuring your contribution is meaningful and purposeful.",
                image: ItembImg,  
              },
              {
                title: "Impact Reports",
                text: "Stay informed with detailed reports showing how your contributions are making a real difference.",
                image: ImpactrImg,
              },
            ].map((item, index) => (
              <div className="impact-card" key={index}>
                <div className="card-img">
                  <img src={item.image} alt={item.title} />
                </div>
                <h3 className="text-title">{item.title}</h3>
                <p className="text-body">{item.text}</p>
                <button className="card-button">Explore</button>
              </div>
            ))}
          </div> 

          <button
            className="arrow"
            onClick={() =>
              carouselRef.current.scrollBy({ left: 360, behavior: "smooth" })
            }
          >
            &#10095;
          </button>
        </div>
      </section>

      {/* ABOUT SECTION */}
      {/* ABOUT US */}
<section className="about">
  <h1>Impact Made Easy.</h1>

  <div className="about-content">
    <img src={aboutImg} alt="About Charitree" className="about-image" />

    <div className="about-text">
      <h2>This Is How We Help You</h2>
      <br />
      <p>
        Charitree is a unified digital ecosystem where schools, donors, and NGOs converge to create lasting social change. We believe that the biggest barrier to giving isn't a lack of heart it’s a lack of clarity.
        By streamlining campaign management and enforcing rigorous verification, we’ve replaced uncertainty with transparency. Whether you are a school listing a critical need or a donor looking to make your mark, Charitree ensures that every contribution takes root and flourishes.
        <br /><br />
        By bridging the gap between intention and action through a modern, secure interface, we are building a future where social impact is as visible as it is vital. Here, every seed of support is nurtured by trust, growing into a forest of opportunity for the communities we serve.
      </p>

      {/* NEW BUTTONS ADDED HERE */}
      <div className="about-buttons">
        <button className="primary1-btn">Learn More</button>
        <button className="primary1-btn">Watch a Video</button>
      </div>
    </div>
  </div>
</section>

      {/* REVIEWS SECTION - ENHANCED */}
      <section className="reviews" id="reviews">
        <h1>What Our <span>Clients</span> Say</h1>
        <p className="reviews-subtitle">Trusted by schools, donors, and NGOs worldwide</p>
        
        <div className="reviews-container">
          <div className="review-card">
            <div className="stars">
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
            </div>
            <p>
              "Charitree completely transformed our fundraising process. 
              The transparency and trust it builds with donors is remarkable. 
              We've raised 3x more than last year!"
            </p>
            <div className="review-user">
              <div className="user-avatar">
                <div className="avatar-placeholder">SM</div>
              </div>
              <div className="user-info">
                <h4>Sarah Mitchell</h4>
                <span>Executive Director, Education First</span>
              </div>
            </div>
          </div>

          <div className="review-card featured">
            <div className="stars">
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
            </div>
            <p>
              "The unified dashboard saves us 15+ hours every week. 
              Finally, a platform that understands both NGO needs and 
              donor expectations perfectly."
            </p>
            <div className="review-user">
              <div className="user-avatar">
                <div className="avatar-placeholder green">DC</div>
              </div>
              <div className="user-info">
                <h4>David Chen</h4>
                <span>Operations Lead, Hope Initiative</span>
              </div>
            </div>
          </div>

          <div className="review-card">
            <div className="stars">
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
            </div>
            <p>
              "As a donor, I finally feel confident that my contributions 
              are making real impact. The verification system is 
              game-changing for the entire charitable sector."
            </p>
            <div className="review-user">
              <div className="user-avatar">
                <div className="avatar-placeholder">PP</div>
              </div>
              <div className="user-info">
                <h4>Priya Patel</h4>
                <span>Philanthropy Partner</span>
              </div>
            </div>
          </div>

          <div className="review-card">
            <div className="stars">
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
              <span className="star filled">★</span>
            </div>
            <p>
              "The item-based giving feature is brilliant. We received 
              exactly what we needed, when we needed it. No more, no less."
            </p>
            <div className="review-user">
              <div className="user-avatar">
                <div className="avatar-placeholder">MT</div>
              </div>
              <div className="user-info">
                <h4>Michael Thompson</h4>
                <span>School Coordinator</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
       {/* CONTACT SECTION - UPDATED */}
      <section className="contact" id="contact">
        <div className="contact-wrapper">
          <h1>Send us a Message</h1>
          <p className="contact-subtitle">
            Fill out the form below and we'll get back to you as soon as possible
          </p>

          <div className="contact-card">
            <form className="contact-form">
              <div className="row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input type="text" placeholder="Enter your full name" required />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" placeholder="Enter your email" required />
                </div>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input type="text" placeholder="What is this regarding?" required />
              </div>

              <div className="form-group">
                <label>Your Message *</label>
                <textarea
                  rows="6"
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="send-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
      {/* FOOTER */}
      <footer className="footer">
  <div className="footer-container">

    <h3 className="footer-title">ChariTree</h3>

    <p className="footer-tagline">
      Growing kindness, one contribution at a time 🌱
    </p>

    <p className="footer-desc">
      A platform connecting donors, schools, and communities to create real impact.
    </p>

    <p className="footer-copy">
      © 2026 ChariTree. All rights reserved.
    </p>

  </div>
</footer>

    </>
  );
};

export default Landing;