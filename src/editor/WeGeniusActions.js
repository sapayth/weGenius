import { __ } from '@wordpress/i18n';
import { PluginSidebar } from '@wordpress/editor';
import {
    PanelBody,
    Button,
    TextControl,
    SelectControl,
} from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { useState } from '@wordpress/element';

const WeGeniusActionsSidebar = () => {
    const [ text, setText ] = useState( '' );
    const [ select, setSelect ] = useState( 'a' );

    return (
        <PluginSidebar
            name="wegenius-actions-sidebar"
            title={ __( 'weGenius Actions', 'wegenius' ) }
            icon={ 'smiley' }
        >
            <PanelBody>
                <h2>
                    { __( 'weGenius Actions Panel', 'wegenius' ) }
                </h2>
                <p>
                    { __(
                        'This is the weGenius Actions sidebar panel for the block editor.',
                        'wegenius'
                    ) }
                </p>
                <TextControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label={ __( 'Text Control', 'wegenius' ) }
                    value={ text }
                    onChange={ ( newText ) => setText( newText ) }
                />
                <SelectControl
                    label={ __( 'Select Control', 'wegenius' ) }
                    value={ select }
                    options={ [
                        { value: 'a', label: 'Option A' },
                        { value: 'b', label: 'Option B' },
                        { value: 'c', label: 'Option C' },
                    ] }
                    onChange={ ( newSelect ) => setSelect( newSelect ) }
                />
                <Button variant="primary">{ __( 'Primary Button', 'wegenius' ) } </Button>
            </PanelBody>
        </PluginSidebar>
    );
};

// Register the plugin.
registerPlugin( 'wegenius-actions', { 
    render: WeGeniusActionsSidebar 
} );
