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
        'hierarchical'        => true, // services parent/enfant : expose parent/ancestors/parentId en GraphQL
        'show_in_graphql'     => true,
        'graphql_single_name' => 'service',
        'graphql_plural_name' => 'services',
        'supports'            => ['title', 'thumbnail', 'page-attributes'],
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

    // Taxonomie "Stack technique" (tags) rattachee aux projets, exposee en GraphQL.
    register_taxonomy('stack_tech', ['projet'], [
        'labels' => [
            'name'          => 'Stack technique',
            'singular_name' => 'Technologie',
            'menu_name'     => 'Stack technique',
            'add_new_item'  => 'Ajouter une technologie',
            'search_items'  => 'Rechercher une technologie',
        ],
        'public'              => true,
        'hierarchical'        => false,
        'show_admin_column'   => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'stackTech',
        'graphql_plural_name' => 'stackTechs',
        'rewrite'             => ['slug' => 'stack'],
    ]);

});
