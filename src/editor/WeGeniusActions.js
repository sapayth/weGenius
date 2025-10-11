import { __ } from '@wordpress/i18n';
import { PluginSidebar } from '@wordpress/editor';
import {
    PanelBody,
    Button,
    RadioControl,
    Spinner,
    TextControl,
} from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { AnalysisDetailsModal } from '../js/components/Dashboard/AnalysisDetailsModal';
import { API_ENDPOINTS, getApiHeaders } from '../js/constants/api';

// Configure apiFetch to use the nonce for authentication
if ( window.wegeniusAdmin && window.wegeniusAdmin.nonce ) {
    apiFetch.use( apiFetch.createNonceMiddleware( window.wegeniusAdmin.nonce ) );
}

const WeGeniusActionsSidebar = () => {
    const [ selectedOption, setSelectedOption ] = useState( 'improve' );
    const [ focusKeyphrase, setFocusKeyphrase ] = useState( '' );
    const [ isScanning, setIsScanning ] = useState( false );
    const [ scanResult, setScanResult ] = useState( null );
    const [ scanStatus, setScanStatus ] = useState( null );
    const [ isCheckingStatus, setIsCheckingStatus ] = useState( false );
    const [ isInitialLoading, setIsInitialLoading ] = useState( true );
    const [ analysisDetails, setAnalysisDetails ] = useState( null );
    const [ suggestions, setSuggestions ] = useState( null );
    const [ isModalOpen, setIsModalOpen ] = useState( false );
    const [ selectedAnalysis, setSelectedAnalysis ] = useState( null );
    
    // Yoast integration state
    const [ isYoastActive, setIsYoastActive ] = useState( false );
    const [ yoastData, setYoastData ] = useState( {
        metaDescription: false,
        readability: false,
        schema: false
    } );

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
        
        // Get categories - use stable references to prevent re-renders
        const categoryIds = postData?.categories || [];
        const categoryNames = categoryIds.length > 0 
            ? categoryIds.map( id => getEntityRecord( 'taxonomy', 'category', id ) )
                .filter( Boolean )
                .map( cat => cat.name )
                .filter( Boolean )
            : [];
        
        // Get tags - use stable references to prevent re-renders
        const tagIds = postData?.tags || [];
        const tagNames = tagIds.length > 0
            ? tagIds.map( id => getEntityRecord( 'taxonomy', 'post_tag', id ) )
                .filter( Boolean )
                .map( tag => tag.name )
                .filter( Boolean )
            : [];
        
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
    }, [] ); // Remove postId dependency to avoid circular reference

    // Check if Yoast plugin is active and fetch Yoast data
    useEffect( () => {
        const checkYoastPlugin = async () => {
            try {
                // Check if Yoast SEO plugin is active
                const response = await apiFetch( {
                    path: '/wp/v2/plugins',
                    method: 'GET'
                } );
                
                const yoastPlugin = response.find( plugin => 
                    plugin.plugin === 'wordpress-seo/wp-seo.php' && plugin.status === 'active'
                );
                
                setIsYoastActive( !!yoastPlugin );
                
                // If Yoast is active, fetch Yoast data for current post
                if ( yoastPlugin && postId ) {
                    await fetchYoastData();
                }
            } catch ( error ) {
                console.log( 'WeGeniusActions: Yoast plugin check failed:', error );
                setIsYoastActive( false );
            }
        };
        
        if ( postId ) {
            checkYoastPlugin();
        }
    }, [ postId ] );

    // Automatically check scan status when component mounts or postId changes
    useEffect( () => {
        if ( postId ) {
            checkScanStatus( true );
        }
    }, [ postId ] );

    // Debug modal state changes
    useEffect( () => {
        if ( isModalOpen ) {
            console.log('WeGeniusActions: Modal opened with analysis:', selectedAnalysis);
        }
    }, [ isModalOpen, selectedAnalysis ] );

    // Fetch Yoast SEO data for current post
    const fetchYoastData = async () => {
        if ( !postId || !isYoastActive ) {
            return;
        }

        try {
            // Fetch Yoast meta data for the current post
            const response = await apiFetch( {
                path: `/wp/v2/posts/${postId}`,
                method: 'GET'
            } );

            // Extract Yoast meta fields
            const metaDescription = response.yoast_head_json?.description || '';
            const readabilityScore = response.yoast_head_json?.readability_score || 0;
            const schemaData = response.yoast_head_json?.schema || {};

            // Update Yoast data state with available data
            setYoastData( {
                metaDescription: !!metaDescription,
                readability: readabilityScore > 0,
                schema: Object.keys( schemaData ).length > 0
            } );

        } catch ( error ) {
            console.log( 'WeGeniusActions: Error fetching Yoast data:', error );
        }
    };

    // Handle Yoast checkbox changes
    const handleYoastDataChange = ( field, checked ) => {
        setYoastData( prev => ( {
            ...prev,
            [ field ]: checked
        } ) );
    };

    // Fetch detailed analysis results and suggestions using new wp_post_id based endpoint
    const fetchAnalysisDetails = async ( wpPostId, analysisType = 'improve' ) => {
        try {
            // Fetch analysis results using new endpoint structure
            const resultsUrl = API_ENDPOINTS.getAnalysisResultsByPostIdAndType(wpPostId, analysisType);
            const headers = getApiHeaders();
            const resultsResponse = await fetch(resultsUrl, {
                method: 'GET',
                headers
            } );
            
            if ( resultsResponse.ok ) {
                const resultsData = await resultsResponse.json();
                const data = resultsData.success ? resultsData.data : resultsData;
                
                // Set analysis details from the new structure
                setAnalysisDetails( {
                    analysis: data.analysis,
                    post: data.post,
                    metrics: data.analysis?.metrics || {}
                } );
                
                // Set suggestions from the new structure (already grouped by type)
                if ( data.suggestions ) {
                    // Flatten all suggestions into a single array for compatibility
                    const allSuggestions = [];
                    Object.keys( data.suggestions ).forEach( type => {
                        if ( Array.isArray( data.suggestions[type] ) ) {
                            data.suggestions[type].forEach( suggestion => {
                                allSuggestions.push( {
                                    ...suggestion,
                                    suggestion_type: type
                                } );
                            } );
                        }
                    } );
                    setSuggestions( allSuggestions );
                }
            }
            
        } catch ( error ) {
            console.error( 'Error fetching analysis details:', error );
        }
    };

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
            // Call external WeGenius API using new wp_post_id based endpoint
            const url = API_ENDPOINTS.getAnalysisResultsByPostId(postId);
            const headers = getApiHeaders();
            const response = await fetch(url, {
                method: 'GET',
                headers
            } );
            
            if ( response.status === 404 ) {
                // No analyses found for this post - this is normal for new posts
                console.log( `WeGeniusActions: No analyses found for post ${ postId } - this is normal for new posts` );
                setScanStatus( null );
                return;
            }
            
            if ( ! response.ok ) {
                throw new Error( `HTTP error! status: ${ response.status }` );
            }
            
            const responseData = await response.json();
            
            // Extract the actual data from the API response structure
            const data = responseData.success ? responseData.data : responseData;

            // New API structure: data.analyses is an array of all analyses
            if ( data.analyses && data.analyses.length > 0 ) {
                // Get the latest analysis (first in the array)
                const latestAnalysis = data.analyses[0];
                setScanStatus( {
                    analysis: latestAnalysis.analysis,
                    post: data.post,
                    total_analyses: data.total_analyses
                } );
                
                // If analysis is completed, fetch detailed results and suggestions
                if ( latestAnalysis.analysis?.status === 'completed' ) {
                    fetchAnalysisDetails( postId, latestAnalysis.analysis.type );
                }
            } else {
                setScanStatus( null );
            }
        } catch ( error ) {
            console.error( 'WeGeniusActions: Error checking scan status:', error );
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
                focus_keyphrase: focusKeyphrase || '', // Add focus keyphrase if provided
                meta_data: {
                    categories: categories || [],
                    tags: tags || [],
                    excerpt: excerpt || '',
                },
                // Include Yoast data if plugin is active
                yoast_data: isYoastActive ? {
                    include_meta_description: yoastData.metaDescription,
                    include_readability: yoastData.readability,
                    include_schema: yoastData.schema
                } : null
            };

            // Send request to external WeGenius API
            const url = API_ENDPOINTS.submitArticle();
            const headers = getApiHeaders();
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify( requestData )
            } );
            
            if ( ! response.ok ) {
                throw new Error( `HTTP error! status: ${ response.status }` );
            }
            
            const data = await response.json();

            setScanResult( {
                success: true,
                data: data,
                message: __( 'Analysis submitted successfully!', 'wegenius' )
            } );

            // Check status after successful submission
            setTimeout( () => {
                checkScanStatus();
            }, 1000 );

        } catch ( error ) {
            setScanResult( {
                success: false,
                error: error.message || __( 'Failed to submit for analysis', 'wegenius' )
            } );
        } finally {
            setIsScanning( false );
        }
    };

    /**
     * Handle opening the analysis details modal
     */
    const handleOpenDetails = () => {
        console.log('WeGeniusActions: handleOpenDetails called');
        console.log('WeGeniusActions: scanStatus:', scanStatus);
        console.log('WeGeniusActions: scanStatus?.analysis:', scanStatus?.analysis);
        
        if ( scanStatus?.analysis ) {
            console.log('WeGeniusActions: Setting selected analysis and opening modal');
            // Ensure wp_post_id is included in the analysis object
            const analysisWithPostId = {
                ...scanStatus.analysis,
                wp_post_id: postId
            };
            setSelectedAnalysis( analysisWithPostId );
            setIsModalOpen( true );
        } else {
            console.log('WeGeniusActions: No analysis available, but opening modal for testing');
            // For testing purposes, create a mock analysis object
            const mockAnalysis = {
                id: postId,
                wp_post_id: postId,
                status: 'completed',
                analysis_type: 'improve',
                created_at: new Date().toISOString()
            };
            setSelectedAnalysis( mockAnalysis );
            setIsModalOpen( true );
        }
    };

    /**
     * Handle closing the analysis details modal
     */
    const handleCloseModal = () => {
        console.log('WeGeniusActions: handleCloseModal called');
        setIsModalOpen( false );
        setSelectedAnalysis( null );
    };

    return (
        <>
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
                <TextControl
                    label={ __( 'Focus keyphrase (optional)', 'wegenius' ) }
                    value={ focusKeyphrase }
                    onChange={ ( value ) => setFocusKeyphrase( value ) }
                    placeholder={ __( 'Enter your focus keyphrase...', 'wegenius' ) }
                    help={ __( 'Specify a keyphrase to focus the analysis on specific terms or topics.', 'wegenius' ) }
                    __next40pxDefaultSize={ true }
                    __nextHasNoMarginBottom={ true }
                />
            </div>

            { isYoastActive && (
                <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ 
                        margin: '0 0 0.75rem 0', 
                        fontSize: '0.9rem', 
                        fontWeight: 'bold',
                        color: '#1d2327'
                    }}>
                        { __( 'Yoast data to send', 'wegenius' ) }
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <CheckboxControl
                            label={ __( 'Meta description', 'wegenius' ) }
                            checked={ yoastData.metaDescription }
                            onChange={ ( checked ) => handleYoastDataChange( 'metaDescription', checked ) }
                            help={ __( 'Include Yoast meta description in analysis', 'wegenius' ) }
                        />
                        
                        <CheckboxControl
                            label={ __( 'Readability', 'wegenius' ) }
                            checked={ yoastData.readability }
                            onChange={ ( checked ) => handleYoastDataChange( 'readability', checked ) }
                            help={ __( 'Include Yoast readability score in analysis', 'wegenius' ) }
                        />
                        
                        <CheckboxControl
                            label={ __( 'Schema', 'wegenius' ) }
                            checked={ yoastData.schema }
                            onChange={ ( checked ) => handleYoastDataChange( 'schema', checked ) }
                            help={ __( 'Include Yoast schema markup in analysis', 'wegenius' ) }
                        />
                    </div>
                </div>
            ) }
            <div style={{ marginTop: '1.5rem' }}>
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

                    { scanStatus.metrics && scanStatus.analysis?.status === 'completed' && (
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
                                    { __( 'Analysis Metrics', 'wegenius' ) }
                                </h4>
                            </div>
                            
                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                { Object.entries( scanStatus.metrics ).map( ( [ key, value ] ) => {
                                    const score = typeof value === 'number' ? value : 0;
                                    const getScoreColor = ( score ) => {
                                        if ( score >= 80 ) return '#00a32a';
                                        if ( score >= 60 ) return '#dba617';
                                        return '#d63384';
                                    };
                                    
                                    const getScoreLabel = ( key ) => {
                                        const labels = {
                                            seo_score: __( 'SEO Score', 'wegenius' ),
                                            content_gaps: __( 'Content Gaps', 'wegenius' ),
                                            competitor_analysis: __( 'Competitor Analysis', 'wegenius' )
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

            <PanelBody title={ __( 'Improve', 'wegenius' ) } initialOpen={false}>
                { scanStatus?.analysis?.status === 'completed' && scanStatus?.analysis?.analysis_type === 'improve' && (
                    <div>
                        <h4 style={{ 
                            margin: '0 0 0.75rem 0', 
                            fontSize: '0.9rem', 
                            fontWeight: 'bold',
                            color: '#1d2327'
                        }}>
                            { __( 'Improvements', 'wegenius' ) } ({ Array.isArray( suggestions ) ? suggestions.filter( s => s.type === 'content_improvement' ).length : 0 })
                        </h4>
                        
                        { Array.isArray( suggestions ) && suggestions.filter( s => s.type === 'content_improvement' ).map( ( suggestion, index ) => (
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
                                        { suggestion.title || suggestion.type || __( 'Improvement', 'wegenius' ) }
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#1d2327',
                                        lineHeight: '1.4'
                                    }}>
                                        { suggestion.description || suggestion.content || __( 'Improvement suggestion available.', 'wegenius' ) }
                                    </div>
                                </div>
                            </div>
                        ) ) }
                        
                        { (!Array.isArray( suggestions ) || suggestions.filter( s => s.type === 'content_improvement' ).length === 0) && (
                            <div style={{ 
                                padding: '0.75rem',
                                backgroundColor: '#f0f8f0',
                                borderRadius: '0.25rem',
                                fontSize: '0.8rem',
                                color: '#1d2327'
                            }}>
                                { __( 'No improvement suggestions available at this time.', 'wegenius' ) }
                            </div>
                        ) }
                    </div>
                ) }
            </PanelBody>
            
            <PanelBody title={ __( 'Gaps', 'wegenius' ) } initialOpen={false}>
                { scanStatus?.analysis?.status === 'completed' && scanStatus?.analysis?.analysis_type === 'content_gap' && (
                    <div>
                        <h4 style={{ 
                            margin: '0 0 0.75rem 0', 
                            fontSize: '0.9rem', 
                            fontWeight: 'bold',
                            color: '#1d2327'
                        }}>
                            { __( 'Content Gaps', 'wegenius' ) } ({ Array.isArray( suggestions ) ? suggestions.filter( s => s.type === 'seo' || s.type === 'structure' ).length : 0 })
                        </h4>
                        
                        { Array.isArray( suggestions ) && suggestions.filter( s => s.type === 'seo' || s.type === 'structure' ).map( ( suggestion, index ) => (
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
                                        { suggestion.title || suggestion.type || __( 'Gap', 'wegenius' ) }
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#1d2327',
                                        lineHeight: '1.4'
                                    }}>
                                        { suggestion.description || suggestion.content || __( 'Content gap identified.', 'wegenius' ) }
                                    </div>
                                </div>
                            </div>
                        ) ) }
                        
                        { (!Array.isArray( suggestions ) || suggestions.filter( s => s.type === 'seo' || s.type === 'structure' ).length === 0) && (
                            <div style={{ 
                                padding: '0.75rem',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '0.25rem',
                                fontSize: '0.8rem',
                                color: '#1d2327'
                            }}>
                                { __( 'No content gaps identified at this time.', 'wegenius' ) }
                            </div>
                        ) }
                    </div>
                ) }
            </PanelBody>
            
            <PanelBody title={ __( 'Ideas', 'wegenius' ) } initialOpen={false}>
                { scanStatus?.analysis?.status === 'completed' && (
                    <div>
                        <h4 style={{ 
                            margin: '0 0 0.75rem 0', 
                            fontSize: '0.9rem', 
                            fontWeight: 'bold',
                            color: '#1d2327'
                        }}>
                            { __( 'Ideas & Suggestions', 'wegenius' ) } ({ Array.isArray( suggestions ) ? suggestions.length : 0 })
                        </h4>
                        
                        { Array.isArray( suggestions ) && suggestions.map( ( suggestion, index ) => (
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
                                        { suggestion.title || suggestion.type || __( 'Idea', 'wegenius' ) }
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#1d2327',
                                        lineHeight: '1.4'
                                    }}>
                                        { suggestion.description || suggestion.content || __( 'Consider this suggestion.', 'wegenius' ) }
                                    </div>
                                    { suggestion.type && (
                                        <div style={{ 
                                            fontSize: '0.7rem', 
                                            color: '#6c757d',
                                            marginTop: '0.25rem',
                                            fontStyle: 'italic'
                                        }}>
                                            Type: { suggestion.type }
                                        </div>
                                    ) }
                                </div>
                            </div>
                        ) ) }
                        
                        { (!Array.isArray( suggestions ) || suggestions.length === 0) && (
                            <div style={{ 
                                padding: '0.75rem',
                                backgroundColor: '#e7f3ff',
                                borderRadius: '0.25rem',
                                fontSize: '0.8rem',
                                color: '#1d2327'
                            }}>
                                { __( 'No suggestions available at this time.', 'wegenius' ) }
                            </div>
                        ) }
                    </div>
                ) }
            </PanelBody>

            <Button 
            onClick={ () => {
                console.log('WeGeniusActions: Details button clicked');
                handleOpenDetails();
            }}
            variant="secondary"
        >
            { __( 'Details', 'wegenius' ) }
        </Button>
        </PanelBody>

        
        </PluginSidebar>

        {/* Analysis Details Modal */}
        <AnalysisDetailsModal
            isOpen={ isModalOpen }
            onClose={ handleCloseModal }
            analysis={ selectedAnalysis }
        />
        </>
    );
};

// Register the plugin.
registerPlugin( 'wegenius-actions', { 
    render: WeGeniusActionsSidebar 
} );
