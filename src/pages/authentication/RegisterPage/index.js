import React from 'react';
import { Link } from 'react-router-dom';
import styles from './RegisterPage.module.css';
import API from '../../../utils/API';
import { Sprite } from '../../../Sprite';
import Texture from '../../../Texture';
import Actors from '../../../actors/actors.json';

class RegisterPage extends React.Component {
    constructor (props) {
        super(props);
        this.myCanvasRef = React.createRef();
    }

    state = {
        username: '',
        email: '',
        password: '',
        character: ''
    };

    handleInputChange = event => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    };

    handleSubmit = event => {
        event.preventDefault();
        const { username, email, password } = this.state;
        console.log(username, email, password);
        const body = {
            username: username,
            email: email,
            password: password
        };
        console.log(body);
        API.register(body)
            .then(() => {
                console.log('boop');
                this.props.history.push('/game');
            })
            .catch(function(err) {
                console.log(err);
            });
    };

    componentDidMount = () => {
        this.drawSprites = Sprite.drawSpritesFactory();
        
        requestAnimationFrame(this.gameLoop);
    }
    
    gameLoop = () => {
        this.Sprite = new Sprite(Actors['youngster'].south);
        
        const gl = this.myCanvasRef.current.getContext('webgl');

        this.actorSpriteSheet = new Texture(gl, './spritesheets/overworld-actors.png');
        this.drawSprites(gl, [this.Sprite], {x: 0, y: 0}, this.actorSpriteSheet);
        requestAnimationFrame(this.gameLoop)
    }

    drawSprites = (gl, Sprite, {x, y}, spriteSheet) => {
        
    }

    render() {
        return (
            <div className={styles['register-page']}>
                <div className={styles['register-form-container']}>
                    <form className={styles['register-form']}>
                        <div className={styles['register-form-inputs']}>
                            <input
                                className={styles['inputs']}
                                name="username"
                                onChange={this.handleInputChange}
                                value={this.state.username}
                                placeholder="Username"
                            />
                            <input
                                className={styles['inputs']}
                                name="email"
                                onChange={this.handleInputChange}
                                value={this.state.email}
                                placeholder="Email"
                            />
                            <input
                                className={styles['inputs']}
                                name="password"
                                onChange={this.handleInputChange}
                                value={this.state.password}
                                type="password"
                                placeholder="Password"
                            />
                            <label>Character Select</label>
                            <div className={styles["figures-container"]}>
                                <figure
                                    onClick={() => {
                                        this.setState({character: 'nobody'})
                                    }}
                                >
                                    <canvas
                                        ref={this.myCanvasRef}
                                    />
                                </figure>
                                <figure
                                    onClick={() => {
                                        this.setState({character: 'nobody2'})
                                    }}
                                >
                                    <canvas  />
                                </figure>
                            </div>
                        </div>
                        <button
                            className={styles['register-button']}
                            onClick={this.handleSubmit}
                        >
                            Register
                        </button>
                        <div>
                            <span className={styles['already-have-account']}>
                                Already have an account?{' '}
                                <Link to="/">Login!</Link>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default RegisterPage;
