<?php
/**
 * Custom Post Types : Projets et Services
 * + Champs ACF homepage (Hero)
 */

add_action('init', function () {

    register_post_type('projet', [
        'labels' => [
            'name'          => 'Projets',
            'singular_name' => 'Projet',
        ],
        'public'              => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'projet',
        'graphql_plural_name' => 'projets',
        'supports'            => ['title', 'thumbnail'],
    ]);

    register_post_type('service', [
        'labels' => [
            'name'          => 'Services',
            'singular_name' => 'Service',
        ],
        'public'              => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'service',
        'graphql_plural_name' => 'services',
        'supports'            => ['title', 'thumbnail'],
    ]);

    register_post_type('processus', [
        'labels' => [
            'name'          => 'Processus',
            'singular_name' => 'Étape',
        ],
        'public'              => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'etape',
        'graphql_plural_name' => 'etapes',
        'supports'            => ['title', 'page-attributes'],
        'menu_icon'           => 'dashicons-list-view',
    ]);

    register_post_type('subtitle', [
        'labels' => [
            'name'          => 'Sous-titres',
            'singular_name' => 'Sous-titre',
        ],
        'public'              => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'subtitle',
        'graphql_plural_name' => 'subtitles',
        'supports'            => ['title'],
    ]);

});
