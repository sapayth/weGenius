import { __ } from '@wordpress/i18n';
import { PluginSidebar } from '@wordpress/editor';
import {
    PanelBody,
    Button,
    RadioControl,
    Spinner,
} from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

const WeGeniusActionsSidebar = () => {
    const [ selectedOption, setSelectedOption ] = useState( 'improve' );
    const [ isScanning, setIsScanning ] = useState( false );
    const [ scanResult, setScanResult ] = useState( null );

    // Get current post data
    const { postId, postTitle, postContent, postPermalink } = useSelect( ( select ) => {
        const { getCurrentPost } = select( 'core/editor' );
        const { getEntityRecord } = select( 'core' );
        const post = getCurrentPost();
        
        // Get post data from the editor
        const postData = getEntityRecord( 'postType', 'post', post?.id );
        
        return {
            postId: post?.id,
            postTitle: post?.title || postData?.title?.rendered || '',
            postContent: post?.content || postData?.content?.rendered || '',
            postPermalink: postData?.link || '',
        };
    } );

    const handleScan = async () => {
        if ( ! postId ) {
            console.error( 'No post ID available' );
            return;
        }

        setIsScanning( true );
        setScanResult( null );

        try {
            // Prepare the request data according to the API spec
            const requestData = {
                wp_post_id: postId,
                title: postTitle || '',
                content: postContent || '',
                permalink: postPermalink || '',
                featured_image: '', // TODO: Get featured image URL
                status: 'published', // TODO: Get actual post status
                published_at: new Date().toISOString(),
                author_name: '', // TODO: Get author name
                action_type: selectedOption, // This maps to our radio buttons
                meta_data: {
                    categories: [], // TODO: Get post categories
                    tags: [], // TODO: Get post tags
                    excerpt: '', // TODO: Get post excerpt
                }
            };

            // Send request to WeGenius API
            const response = await apiFetch( {
                path: '/wegenius/v1/scan',
                method: 'POST',
                data: requestData,
            } );

            setScanResult( {
                success: true,
                data: response,
                message: __( 'Analysis submitted successfully!', 'wegenius' )
            } );

        } catch ( error ) {
            console.error( 'Scan error:', error );
            setScanResult( {
                success: false,
                error: error.message || __( 'Failed to submit for analysis', 'wegenius' )
            } );
        } finally {
            setIsScanning( false );
        }
    };

    return (
        <PluginSidebar
            name="wegenius-actions-sidebar"
            title={ __( 'weGenius Actions', 'wegenius' ) }
            icon={ 'smiley' }
        >
            <PanelBody>
                <RadioControl
                    label={ __( 'Select Analysis Type', 'wegenius' ) }
                    selected={ selectedOption }
                    options={ [
                        { label: __( 'Improve', 'wegenius' ), value: 'improve' },
                        { label: __( 'Gaps', 'wegenius' ), value: 'gaps' },
                        { label: __( 'Ideas', 'wegenius' ), value: 'ideas' },
                    ] }
                    onChange={ ( value ) => setSelectedOption( value ) }
                />
                <div style={{ marginTop: '1rem' }}>
                    <Button 
                        variant="primary" 
                        onClick={ handleScan }
                        className="wegen-scan-button"
                        disabled={ isScanning || ! postId }
                    >
                        { isScanning ? (
                            <>
                                <Spinner />
                                { __( 'Scanning...', 'wegenius' ) }
                            </>
                        ) : (
                            __( 'Scan', 'wegenius' )
                        ) }
                    </Button>
                </div>

                { scanResult && (
                    <div style={{ 
                        marginTop: '1rem', 
                        padding: '0.75rem',
                        backgroundColor: scanResult.success ? '#d4edda' : '#f8d7da',
                        border: `1px solid ${ scanResult.success ? '#c3e6cb' : '#f5c6cb' }`,
                        borderRadius: '0.25rem',
                        color: scanResult.success ? '#155724' : '#721c24'
                    }}>
                        { scanResult.success ? (
                            <p style={{ margin: 0 }}>
                                ✅ { scanResult.message }
                            </p>
                        ) : (
                            <p style={{ margin: 0 }}>
                                ❌ { scanResult.error }
                            </p>
                        ) }
                    </div>
                ) }
            </PanelBody>
        </PluginSidebar>
    );
};

// Register the plugin.
registerPlugin( 'wegenius-actions', { 
    render: WeGeniusActionsSidebar 
} );
