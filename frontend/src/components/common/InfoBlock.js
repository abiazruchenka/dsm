export default function InfoBlock({ title, description }) {
    return (
        <div className="info-block">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}