// NavMenu.jsx
import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import MenuDownloads from '../data/MenuDownloads';

const NavMenu = ({ onSaveGeoJSON, onSaveKML, onSaveWKT, onSaveGeopackage }) => {
    const classNames = (...classes) => {
        return classes.filter(Boolean).join(' ');
    };

    return (
        <Menu as="div" className="container-NavMenu">
            <div>
                <Menu.Button className="menubutton">
                    List
                    <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                </Menu.Button>
            </div>
            <Transition
                as={React.Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="menu-items">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <div
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'block px-4 py-2 text-sm w-full text-left'
                                    )}
                                >
                                    <MenuDownloads 
                                        onSaveGeoJSON={onSaveGeoJSON}
                                        onSaveKML={onSaveKML}
                                        onSaveWKT={onSaveWKT}
                                        onSaveGeopackage={onSaveGeopackage}
                                    />
                                </div>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}

export default NavMenu;
