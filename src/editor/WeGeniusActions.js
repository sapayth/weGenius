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

// Configure apiFetch to use the nonce for authentication
if ( window.wegeniusAdmin && window.wegeniusAdmin.nonce ) {
    apiFetch.use( apiFetch.createNonceMiddleware( window.wegeniusAdmin.nonce ) );
}

const WeGeniusActionsSidebar = () => {
    const [ selectedOption, setSelectedOption ] = useState( 'improve' );
    const [ isScanning, setIsScanning ] = useState( false );
    const [ scanResult, setScanResult ] = useState( null );
    const [ scanStatus, setScanStatus ] = useState( null );
    const [ isCheckingStatus, setIsCheckingStatus ] = useState( false );

    // Get current post data
    const { 
        postId, 
        postTitle, 
        postContent, 
        postPermalink, 
        featuredImageUrl, 
        postStatus, 
        authorName, 
        categories, 
        tags, 
        excerpt 
    } = useSelect( ( select ) => {
        const { getCurrentPost } = select( 'core/editor' );
        const { getEntityRecord, getMedia } = select( 'core' );
        const { getCurrentUser } = select( 'core' );
        const post = getCurrentPost();
        
        // Get post data from the editor
        const postData = getEntityRecord( 'postType', 'post', post?.id );
        
        // Get featured image
        const featuredImageId = postData?.featured_media;
        const featuredImage = featuredImageId ? getMedia( featuredImageId ) : null;
        
        // Get author data
        const authorId = postData?.author;
        const author = authorId ? getEntityRecord( 'root', 'user', authorId ) : null;
        
        // Get categories - use stable references
        const categoryIds = postData?.categories || [];
        const categoryData = categoryIds.map( id => getEntityRecord( 'taxonomy', 'category', id ) ).filter( Boolean );
        const categoryNames = categoryData.map( cat => cat.name ).filter( Boolean );
        
        // Get tags - use stable references
        const tagIds = postData?.tags || [];
        const tagData = tagIds.map( id => getEntityRecord( 'taxonomy', 'post_tag', id ) ).filter( Boolean );
        const tagNames = tagData.map( tag => tag.name ).filter( Boolean );
        
        return {
            postId: post?.id,
            postTitle: post?.title || postData?.title?.rendered || '',
            postContent: post?.content || postData?.content?.rendered || '',
            postPermalink: postData?.link || '',
            featuredImageUrl: featuredImage?.source_url || '',
            postStatus: postData?.status || 'draft',
            authorName: author?.name || '',
            categories: categoryNames,
            tags: tagNames,
            excerpt: postData?.excerpt?.rendered || '',
        };
    }, [] ); // Add empty dependency array to prevent unnecessary re-renders

    // Check scan status for current post
    const checkScanStatus = async () => {
        if ( ! postId ) {
            return;
        }

        setIsCheckingStatus( true );
        
        try {
            const response = await apiFetch( {
                path: `/wegenius/v1/analysis/status/${ postId }`,
                method: 'GET',
            } );

            setScanStatus( response );
        } catch ( error ) {
            console.error( 'Error checking scan status:', error );
            setScanStatus( null );
        } finally {
            setIsCheckingStatus( false );
        }
    };

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
                featured_image: featuredImageUrl || '',
                status: postStatus === 'publish' ? 'published' : ( postStatus || 'draft' ),
                published_at: new Date().toISOString(),
                author_name: authorName || '',
                action_type: selectedOption, // This maps to our radio buttons
                meta_data: {
                    categories: categories || [],
                    tags: tags || [],
                    excerpt: excerpt || '',
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

            // Check status after successful submission
            setTimeout( () => {
                checkScanStatus();
            }, 1000 );

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
                    
                    { postId && (
                        <Button 
                            variant="secondary" 
                            onClick={ checkScanStatus }
                            disabled={ isCheckingStatus }
                            style={{ marginLeft: '0.5rem' }}
                        >
                            { isCheckingStatus ? (
                                <>
                                    <Spinner />
                                    { __( 'Checking...', 'wegenius' ) }
                                </>
                            ) : (
                                __( 'Check Status', 'wegenius' )
                            ) }
                        </Button>
                    ) }
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

                { scanStatus && (
                    <div style={{ 
                        marginTop: '1rem', 
                        padding: '0.75rem',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '0.25rem'
                    }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                            { __( 'Scan Status', 'wegenius' ) }
                        </h4>
                        
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ 
                                marginRight: '0.5rem',
                                fontSize: '1.2rem'
                            }}>
                                { scanStatus.analysis?.status === 'pending' && '⏳' }
                                { scanStatus.analysis?.status === 'processing' && '🔄' }
                                { scanStatus.analysis?.status === 'completed' && '✅' }
                                { scanStatus.analysis?.status === 'failed' && '❌' }
                                { ! scanStatus.analysis?.status && '❓' }
                            </span>
                            <span style={{ 
                                fontWeight: 'bold',
                                color: scanStatus.analysis?.status === 'completed' ? '#28a745' :
                                       scanStatus.analysis?.status === 'failed' ? '#dc3545' :
                                       scanStatus.analysis?.status === 'processing' ? '#007cba' :
                                       scanStatus.analysis?.status === 'pending' ? '#ffc107' : '#6c757d'
                            }}>
                                { scanStatus.analysis?.status ? 
                                    scanStatus.analysis.status.charAt(0).toUpperCase() + scanStatus.analysis.status.slice(1) :
                                    scanStatus.status || __( 'Unknown', 'wegenius' )
                                }
                            </span>
                        </div>

                        { scanStatus.last_analyzed && (
                            <p style={{ 
                                margin: '0.25rem 0', 
                                fontSize: '0.8rem', 
                                color: '#6c757d' 
                            }}>
                                { __( 'Last analyzed:', 'wegenius' ) } { new Date( scanStatus.last_analyzed ).toLocaleString() }
                            </p>
                        ) }

                        { scanStatus.analysis?.results && scanStatus.analysis.status === 'completed' && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <p style={{ 
                                    margin: '0 0 0.25rem 0', 
                                    fontSize: '0.8rem', 
                                    fontWeight: 'bold' 
                                }}>
                                    { __( 'Analysis Results:', 'wegenius' ) }
                                </p>
                                <div style={{ 
                                    maxHeight: '200px', 
                                    overflowY: 'auto',
                                    padding: '0.5rem',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.8rem'
                                }}>
                                    <pre style={{ 
                                        margin: 0, 
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: 'inherit'
                                    }}>
                                        { JSON.stringify( scanStatus.analysis.results, null, 2 ) }
                                    </pre>
                                </div>
                            </div>
                        ) }

                        { scanStatus.analysis?.scores && scanStatus.analysis.status === 'completed' && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <p style={{ 
                                    margin: '0 0 0.25rem 0', 
                                    fontSize: '0.8rem', 
                                    fontWeight: 'bold' 
                                }}>
                                    { __( 'Scores:', 'wegenius' ) }
                                </p>
                                <div style={{ 
                                    padding: '0.5rem',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.8rem'
                                }}>
                                    <pre style={{ 
                                        margin: 0, 
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: 'inherit'
                                    }}>
                                        { JSON.stringify( scanStatus.analysis.scores, null, 2 ) }
                                    </pre>
                                </div>
                            </div>
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
