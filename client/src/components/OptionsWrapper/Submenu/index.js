import React from 'react';
import styles from './Submenu.module.css';
import API from '../../../utils/API';

// {/* {this.props.pokedex.map(({ name, image }, i) => (
//               <Pokemon
//               id={this.props.id}
//                 key={i}
//                 name={name}
//                 dexnum={i}
//                 image={image}
//               />
//             ))} */}

function ListItem(props) {
    switch (
        props.id // id gets converted to a number when passing it down
    ) {
        case 1:
            return (
                <>
                    {props.party.map(({ name, image }, i) => {
                        return (
                            <div key={i} className={styles['pokemon-wrapper']}>
                                <img
                                    className={styles['pokemon-image']}
                                    src={
                                        image ||
                                        'https://via.placeholder.com/50'
                                    }
                                    alt="pokemon"
                                />
                                <span className={styles['pokemon-name']}>
                                    {name}
                                </span>
                            </div>
                        );
                    })}
                </>
            );
        case 2:
            // return <div>These will be the Pokemon from the Pokedex</div>;
            return (
              <>
                  {props.pokedex.map(({ name, image }, i) => {
                      return (
                          <div key={i} className={styles['pokemon-wrapper']}>
                              <img
                                  className={styles['pokemon-image']}
                                  src={
                                      image ||
                                      'https://via.placeholder.com/50'
                                  }
                                  alt="pokemon"
                              />
                              <span className={styles['pokemon-name']}>
                                  {name}
                              </span>
                          </div>
                      );
                  })}
              </>
          );
        case 3:
            return <div>These are the settings (icebox)</div>;
        case 4:
            return (
                <div className={styles['logout-submenu']}>
                    Are you sure?
                    <button onClick={() => {
                        props.logout();
                    }}>Yes</button>
                    <button>Keep Playing</button>
                </div>
            );
        default:
            return <div>Not found</div>;
    }
}

class Submenu extends React.Component {
    handleClose = event => {
        event.preventDefault();
        console.log('Handle close');
        this.props.closeMenu();
    };

    render() {
        return (
            <div className={styles['submenu-wrapper']}>
                <div className={styles['submenu-header']}>
                    <span>{this.props.menuDisplayName}</span>
                    <button
                        className={styles['exit-button']}
                        onClick={this.handleClose}
                    >
                        X
                    </button>
                </div>
                <div className={styles['content-container']}>
                    <ListItem
                        pokedex={this.props.pokedex}
                        party={this.props.party}
                        id={this.props.id}
                        logout={this.props.logout}
                    />
                </div>
            </div>
        );
    }
}

export default Submenu;
