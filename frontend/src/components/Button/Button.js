export default function Button(props){
    return <button 
        className=""
        onClick={props.onClick}
        style={{ backgroundColor: "#841584", color: "#fff" }}
    >
        {props.title}
    </button>
}
