<?php

namespace Octave\CMSBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class Configuration implements ConfigurationInterface
{
    /**
     * @return TreeBuilder
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $root = $treeBuilder->root('octave_cms');

        $root
            ->children()
                ->append($this->createTemplatesNode())
                ->scalarNode('media_upload_path')
                    ->isRequired()
                    ->cannotBeEmpty()
                ->end()
                ->scalarNode('media_resized_path')->end()
                ->scalarNode('media_gallery_item_transformer')
                    ->cannotBeEmpty()
                ->end()
                ->scalarNode('media_gallery_transformer')
                    ->cannotBeEmpty()
                ->end()
                ->arrayNode('resize_options')
                    ->useAttributeAsKey('name')
                    ->arrayPrototype()
                        ->useAttributeAsKey('name')
                        ->arrayPrototype()
                            ->children()
                                ->scalarNode('width')->end()
                                ->scalarNode('height')->end()
                            ->end()
                        ->end()
                    ->end()
                ->end()
                ->arrayNode('file_types')
                    ->scalarPrototype()->end()
                    ->defaultValue(['gif', 'jpeg', 'jpg', 'png', 'svg', 'xml', 'html'])
                ->end()
            ->end();


        return $treeBuilder;
    }

    /**
     * @return mixed
     */
    private function createTemplatesNode()
    {
        return $this->createNode('text_page_templates')
            ->normalizeKeys(false)
            ->useAttributeAsKey('name')
            ->prototype('array')
            ->normalizeKeys(false)
            ->useAttributeAsKey('name')
            ->prototype('variable')->end()
            ->end();

    }

    /**
     * Creates a node.
     *
     * @param string $name The node name.
     *
     * @return \Symfony\Component\Config\Definition\Builder\NodeDefinition The node.
     */
    private function createNode($name)
    {
        return $this->createTreeBuilder()->root($name);
    }

    /**
     * Creates a tree builder.
     *
     * @return \Symfony\Component\Config\Definition\Builder\TreeBuilder The tree builder.
     */
    private function createTreeBuilder()
    {
        return new TreeBuilder();
    }
}