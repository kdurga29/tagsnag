"use client";

export default function HomePage() {
  return (
    <main className="home">
      <section className="home__hero animate-in">
        <div className="home__badge">
          <span className="home__dot" />
          TagSnag
        </div>

        <h1 className="home__title">
          Track Myntra prices.
          <span className="home__titleAccent">When Prices fall!!</span>
        </h1>
      
        <p style={{ marginTop: "20px" }}>
        TagSnag is a price tracking platform that helps users decide the best
        time to buy online products by analyzing price trends.
      </p>

        <div className="home__glowCard" />
      </section>
    </main>
  );
}
