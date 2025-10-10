import { __ } from '@wordpress/i18n';
import { PluginSidebar } from '@wordpress/editor';
import {
    PanelBody,
    Button,
    RadioControl,
    Spinner,
} from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { useState, useEffect } from '@wordpress/element';
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
    const [ isInitialLoading, setIsInitialLoading ] = useState( true );

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

    // Automatically check scan status when component mounts
    useEffect( () => {
        if ( postId ) {
            checkScanStatus( true );
        }
    }, [ postId ] );

    // Check scan status for current post
    const checkScanStatus = async ( isInitialLoad = false ) => {
        if ( ! postId ) {
            return;
        }

        if ( isInitialLoad ) {
            setIsInitialLoading( true );
        } else {
            setIsCheckingStatus( true );
        }
        
        try {
            const response = await apiFetch( {
                path: `/wegenius/v1/analysis/status/${ postId }`,
                method: 'GET',
            } );

            console.log( 'Scan status response:', response );
            setScanStatus( response );
        } catch ( error ) {
            console.error( 'Error checking scan status:', error );
            setScanStatus( null );
        } finally {
            if ( isInitialLoad ) {
                setIsInitialLoading( false );
            } else {
                setIsCheckingStatus( false );
            }
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

            { isInitialLoading && (
                <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.25rem',
                    textAlign: 'center'
                }}>
                    <Spinner />
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                        { __( 'Loading analysis results...', 'wegenius' ) }
                    </p>
                </div>
            ) }

            { scanStatus && !isInitialLoading && (
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
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                marginBottom: '0.75rem' 
                            }}>
                                <h4 style={{ 
                                    margin: 0, 
                                    fontSize: '0.9rem', 
                                    fontWeight: 'bold',
                                    color: '#1d2327'
                                }}>
                                    { __( 'Analysis results', 'wegenius' ) }
                                </h4>
                                <span style={{ 
                                    marginLeft: '0.5rem', 
                                    fontSize: '0.8rem', 
                                    color: '#6c757d',
                                    cursor: 'help'
                                }}>
                                    ❓
                                </span>
                            </div>
                            
                            { scanStatus.analysis.results.gaps && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        marginBottom: '0.5rem',
                                        cursor: 'pointer'
                                    }}>
                                        <span style={{ marginRight: '0.5rem', fontSize: '0.8rem' }}>▲</span>
                                        <h5 style={{ 
                                            margin: 0, 
                                            fontSize: '0.85rem', 
                                            fontWeight: 'bold',
                                            color: '#d63384'
                                        }}>
                                            { __( 'Problems', 'wegenius' ) } ({ scanStatus.analysis.results.gaps.gaps?.length || 0 })
                                        </h5>
                                    </div>
                                    
                                    { scanStatus.analysis.results.gaps.gaps?.map( ( gap, index ) => (
                                        <div key={ index } style={{ 
                                            display: 'flex', 
                                            alignItems: 'flex-start', 
                                            marginBottom: '0.5rem',
                                            padding: '0.5rem',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '0.25rem'
                                        }}>
                                            <span style={{ 
                                                marginRight: '0.5rem', 
                                                marginTop: '0.1rem',
                                                fontSize: '0.7rem',
                                                color: '#6c757d'
                                            }}>
                                                ●
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: 'bold',
                                                    color: '#0073aa',
                                                    textDecoration: 'underline',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    { gap.title || gap.type || __( 'Issue', 'wegenius' ) }
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.75rem', 
                                                    color: '#1d2327',
                                                    lineHeight: '1.4'
                                                }}>
                                                    { gap.description || __( 'This area needs attention.', 'wegenius' ) }
                                                </div>
                                            </div>
                                        </div>
                                    ) ) }
                                </div>
                            ) }

                            { scanStatus.analysis.results.improvements && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        marginBottom: '0.5rem',
                                        cursor: 'pointer'
                                    }}>
                                        <span style={{ marginRight: '0.5rem', fontSize: '0.8rem' }}>▲</span>
                                        <h5 style={{ 
                                            margin: 0, 
                                            fontSize: '0.85rem', 
                                            fontWeight: 'bold',
                                            color: '#00a32a'
                                        }}>
                                            { __( 'Good results', 'wegenius' ) } ({ scanStatus.analysis.results.improvements.length || 0 })
                                        </h5>
                                    </div>
                                    
                                    { scanStatus.analysis.results.improvements.map( ( improvement, index ) => (
                                        <div key={ index } style={{ 
                                            display: 'flex', 
                                            alignItems: 'flex-start', 
                                            marginBottom: '0.5rem',
                                            padding: '0.5rem',
                                            backgroundColor: '#f0f8f0',
                                            borderRadius: '0.25rem'
                                        }}>
                                            <span style={{ 
                                                marginRight: '0.5rem', 
                                                marginTop: '0.1rem',
                                                fontSize: '0.7rem',
                                                color: '#00a32a'
                                            }}>
                                                ●
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: 'bold',
                                                    color: '#0073aa',
                                                    textDecoration: 'underline',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    { improvement.title || improvement.type || __( 'Good practice', 'wegenius' ) }
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.75rem', 
                                                    color: '#1d2327',
                                                    lineHeight: '1.4'
                                                }}>
                                                    { improvement.description || __( 'Well done!', 'wegenius' ) }
                                                </div>
                                            </div>
                                            <span style={{ 
                                                fontSize: '0.7rem',
                                                color: '#6c757d',
                                                cursor: 'pointer'
                                            }}>
                                                👁
                                            </span>
                                        </div>
                                    ) ) }
                                </div>
                            ) }
                        </div>
                    ) }

                    { scanStatus.analysis?.scores && scanStatus.analysis.status === 'completed' && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <h4 style={{ 
                                margin: '0 0 0.75rem 0', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
                                color: '#1d2327'
                            }}>
                                { __( 'Scores', 'wegenius' ) }
                            </h4>
                            
                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '0.5rem'
                            }}>
                                { Object.entries( scanStatus.analysis.scores ).map( ( [ key, value ] ) => {
                                    const score = typeof value === 'number' ? value : 0;
                                    const getScoreColor = ( score ) => {
                                        if ( score >= 80 ) return '#00a32a';
                                        if ( score >= 60 ) return '#dba617';
                                        return '#d63384';
                                    };
                                    
                                    const getScoreLabel = ( key ) => {
                                        const labels = {
                                            overall: __( 'Overall', 'wegenius' ),
                                            seo: __( 'SEO', 'wegenius' ),
                                            readability: __( 'Readability', 'wegenius' ),
                                            structure: __( 'Structure', 'wegenius' ),
                                            engagement: __( 'Engagement', 'wegenius' )
                                        };
                                        return labels[ key ] || key.charAt( 0 ).toUpperCase() + key.slice( 1 );
                                    };
                                    
                                    return (
                                        <div key={ key } style={{ 
                                            padding: '0.75rem',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e9ecef',
                                            borderRadius: '0.25rem',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ 
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold',
                                                color: getScoreColor( score ),
                                                marginBottom: '0.25rem'
                                            }}>
                                                { score }
                                            </div>
                                            <div style={{ 
                                                fontSize: '0.7rem',
                                                color: '#6c757d',
                                                fontWeight: '500'
                                            }}>
                                                { getScoreLabel( key ) }
                                            </div>
                                        </div>
                                    );
                                } ) }
                            </div>
                        </div>
                    ) }
                </div>
            ) }


            <PanelBody title={ __( 'Improve', 'wegenius' ) }>
                { console.log( 'Improve panel - scanStatus:', scanStatus ) }
                { scanStatus?.analysis?.results?.improvements && scanStatus.status === 'completed' && (
                    <div>
                        { console.log( 'Rendering improvements:', scanStatus.analysis.results.improvements ) }
                        <h4 style={{ 
                            margin: '0 0 0.75rem 0', 
                            fontSize: '0.9rem', 
                            fontWeight: 'bold',
                            color: '#1d2327'
                        }}>
                            { __( 'Improvements', 'wegenius' ) } ({ scanStatus.analysis.results.improvements.length || 0 })
                        </h4>
                        
                        { scanStatus.analysis.results.improvements.map( ( improvement, index ) => (
                            <div key={ index } style={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                marginBottom: '0.5rem',
                                padding: '0.5rem',
                                backgroundColor: '#f0f8f0',
                                borderRadius: '0.25rem'
                            }}>
                                <span style={{ 
                                    marginRight: '0.5rem', 
                                    marginTop: '0.1rem',
                                    fontSize: '0.7rem',
                                    color: '#00a32a'
                                }}>
                                    ●
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        fontSize: '0.8rem', 
                                        fontWeight: 'bold',
                                        color: '#0073aa',
                                        textDecoration: 'underline',
                                        marginBottom: '0.25rem'
                                    }}>
                                        { improvement.title || improvement.type || __( 'Good practice', 'wegenius' ) }
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#1d2327',
                                        lineHeight: '1.4'
                                    }}>
                                        { improvement.description || __( 'Well done!', 'wegenius' ) }
                                    </div>
                                </div>
                            </div>
                        ) ) }
                    </div>
                ) }
            </PanelBody>
            
            <PanelBody title={ __( 'Gaps', 'wegenius' ) }>
                { console.log( 'Gaps panel - scanStatus:', scanStatus ) }
                { scanStatus?.analysis?.results?.gaps && scanStatus.status === 'completed' && (
                    <div>
                        { console.log( 'Rendering gaps:', scanStatus.analysis.results.gaps ) }
                        <h4 style={{ 
                            margin: '0 0 0.75rem 0', 
                            fontSize: '0.9rem', 
                            fontWeight: 'bold',
                            color: '#1d2327'
                        }}>
                            { __( 'Problems', 'wegenius' ) } ({ scanStatus.analysis.results.gaps.gaps?.length || 0 })
                        </h4>
                        
                        { scanStatus.analysis.results.gaps.gaps?.map( ( gap, index ) => (
                            <div key={ index } style={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                marginBottom: '0.5rem',
                                padding: '0.5rem',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '0.25rem'
                            }}>
                                <span style={{ 
                                    marginRight: '0.5rem', 
                                    marginTop: '0.1rem',
                                    fontSize: '0.7rem',
                                    color: '#6c757d'
                                }}>
                                    ●
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        fontSize: '0.8rem', 
                                        fontWeight: 'bold',
                                        color: '#0073aa',
                                        textDecoration: 'underline',
                                        marginBottom: '0.25rem'
                                    }}>
                                        { gap.title || gap.type || __( 'Issue', 'wegenius' ) }
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#1d2327',
                                        lineHeight: '1.4'
                                    }}>
                                        { gap.description || __( 'This area needs attention.', 'wegenius' ) }
                                    </div>
                                </div>
                            </div>
                        ) ) }
                    </div>
                ) }
            </PanelBody>
            
            <PanelBody title={ __( 'Ideas', 'wegenius' ) }>
                { console.log( 'Ideas panel - scanStatus:', scanStatus ) }
                { scanStatus?.analysis?.results?.ideas && scanStatus.status === 'completed' && (
                    <div>
                        { console.log( 'Rendering ideas:', scanStatus.analysis.results.ideas ) }
                        <h4 style={{ 
                            margin: '0 0 0.75rem 0', 
                            fontSize: '0.9rem', 
                            fontWeight: 'bold',
                            color: '#1d2327'
                        }}>
                            { __( 'Ideas', 'wegenius' ) } ({ scanStatus.analysis.results.ideas.length || 0 })
                        </h4>
                        
                        { scanStatus.analysis.results.ideas.map( ( idea, index ) => (
                            <div key={ index } style={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                marginBottom: '0.5rem',
                                padding: '0.5rem',
                                backgroundColor: '#e7f3ff',
                                borderRadius: '0.25rem'
                            }}>
                                <span style={{ 
                                    marginRight: '0.5rem', 
                                    marginTop: '0.1rem',
                                    fontSize: '0.7rem',
                                    color: '#0073aa'
                                }}>
                                    💡
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        fontSize: '0.8rem', 
                                        fontWeight: 'bold',
                                        color: '#0073aa',
                                        textDecoration: 'underline',
                                        marginBottom: '0.25rem'
                                    }}>
                                        { idea.title || idea.type || __( 'Idea', 'wegenius' ) }
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#1d2327',
                                        lineHeight: '1.4'
                                    }}>
                                        { idea.description || __( 'Consider this suggestion.', 'wegenius' ) }
                                    </div>
                                </div>
                            </div>
                        ) ) }
                    </div>
                ) }
            </PanelBody>
        </PanelBody>
        </PluginSidebar>
    );
};

// Register the plugin.
registerPlugin( 'wegenius-actions', { 
    render: WeGeniusActionsSidebar 
} );
