export default function NotFoundScreen({ onHome }) {
  return (
    <div className="not-found-screen">
      <div className="not-found-code">404</div>

      <div className="not-found-art">
        <img
          src="/8bit-ogre.png"
          alt="Angry ogre"
          className="ogre-img"
        />
      </div>

      <h1 className="not-found-title">YOU MADE THE OGRE ANGRY!</h1>
      <p className="not-found-desc">This room doesn't exist.<br />Turn back before it's too late.</p>

      <button className="btn-primary" onClick={onHome}>
        &lt; Return Home
      </button>
    </div>
  );
}
