
import React, { Component } from 'react';
import { Link } from 'react-router';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import clazz from 'classname';
import delegate from 'delegate';
import injectSheet from 'react-jss';

import classes from './classes';
import helper from 'utils/helper';
import sine from 'utils/sine';
import ProgressImage from 'ui/ProgressImage';
import Loader from 'ui/Loader';
import Header from 'components/Header';

@inject(stores => ({
    loading: stores.artist.loading,
    profile: stores.artist.profile,
    songs: stores.artist.songs,
    albums: stores.artist.albums,
    similar: stores.artist.similar,
    getArtist: stores.artist.getArtist,
}))
@observer
class Artist extends Component {
    componentWillMount = () => this.props.getArtist(this.props.params.id);

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.id !== this.props.params.id) {
            nextProps.getArtist(nextProps.params.id);
        }
    }

    componentDidMount() {
        var classes = this.props.classes;
        var navs = Array.from(this.refs.header.querySelectorAll('nav'));

        delegate(this.refs.header, 'nav', 'click', e => {
            navs.map(e => e.classList.remove(classes.selected));
            e.target.classList.add(classes.selected);
        });

        sine.show(this.refs.canvas);
    }

    componentWillUnmount = () => sine.hide();

    state = {
        renderTabContent: this.renderSongs.bind(this),
    };

    renderSongs() {
        var { classes, songs } = this.props;

        /* eslint-disable react/jsx-boolean-value */
        return (
            <ul className={classes.songs}>
                {
                    songs.map((e, index) => {
                        return (
                            <li
                                className={clazz({
                                    [classes.playing]: index === 2
                                })}
                                key={index}>
                                <i className="ion-ios-play" />

                                <span data-index>
                                    {index}
                                </span>

                                <span
                                    data-name
                                    title={e.name}>
                                    {e.name}
                                </span>

                                <span
                                    data-album
                                    title={e.al.name}>
                                    <Link to={`/player/1/${e.al.id}`}>
                                        {e.al.name}
                                    </Link>
                                </span>

                                <span data-time>
                                    {helper.getTime(e.dt)}
                                </span>
                            </li>
                        );
                    })
                }
            </ul>
        );
        /* eslint-enable */
    }

    renderAlbums() {
        var { classes, albums } = this.props;

        /* eslint-disable react/jsx-boolean-value */
        return (
            <section className={classes.albums}>
                {
                    albums.map((e, index) => {
                        return (
                            <div
                                className={classes.album}
                                key={index}>
                                <Link to={e.link}>
                                    <ProgressImage {...{
                                        height: 48,
                                        width: 48,
                                        src: e.cover,
                                    }} />
                                </Link>
                                <div className={classes.info}>
                                    <p
                                        data-name
                                        title={e.name}>
                                        {e.name}
                                    </p>

                                    <p data-time>
                                        {moment(e.publishTime).format('L')}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                }
            </section>
        );
        /* eslint-enable */
    }

    renderArtists() {
        var { classes, similar } = this.props;

        return (
            <section className={classes.artists}>
                {
                    similar.map((e, index) => {
                        return (
                            <div
                                className={classes.artist}
                                key={index}>
                                <Link
                                    className="tooltip"
                                    data-text={e.name}
                                    to={e.link}>
                                    <ProgressImage {...{
                                        height: 64,
                                        width: 64,
                                        src: e.avatar,
                                    }} />
                                </Link>
                            </div>
                        );
                    })
                }
            </section>
        );
    }

    render() {
        var { classes, loading, profile } = this.props;
        var size = profile.size || {};

        return (
            <div className={classes.container}>
                <Loader show={loading} />

                <Header {...{
                    showBack: true,
                    showFollow: true,
                    showPlaylist: true,
                }} />
                <div className={classes.hero}>
                    <ProgressImage {...{
                        width: window.innerWidth,
                        height: window.innerWidth / (640 / 300),
                        src: profile.background,
                        thumb: (profile.background || '').replace(/\?.*$/, '?param=20y10'),
                    }} />

                    <div className={classes.inner}>
                        <div className={classes.play}>
                            <i className="ion-ios-play" />
                        </div>

                        <canvas ref="canvas" />

                        <p className={classes.name}>
                            {
                                profile.uid
                                    ? (
                                        <Link to={`/user/${profile.uid}`}>
                                            {profile.name}
                                        </Link>
                                    )
                                    : (
                                        <span>
                                            {profile.name}
                                        </span>
                                    )
                            }
                        </p>

                        <div className={classes.meta}>
                            <span>
                                {size.song} Tracks
                            </span>

                            <span>
                                {size.mv} MV
                            </span>

                            <span>
                                {size.album} Albums
                            </span>
                        </div>
                    </div>
                </div>

                <div className={classes.body}>
                    <header ref="header">
                        <nav
                            onClick={e => this.setState({ renderTabContent: () => this.renderSongs() })}
                            className={classes.selected}>
                            Top 50
                        </nav>

                        <nav onClick={e => this.setState({ renderTabContent: () => this.renderAlbums() })}>
                            All Albums
                        </nav>

                        <nav onClick={e => this.setState({ renderTabContent: () => this.renderArtists() })}>
                            Similar Artist
                        </nav>
                    </header>

                    <div className={classes.content}>
                        {this.state.renderTabContent()}
                    </div>
                </div>
            </div>
        );
    }
}

export default injectSheet(classes)(Artist);
