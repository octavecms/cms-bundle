<?php

namespace Octave\CMSBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class BlockTypesPass implements CompilerPassInterface
{
    /**
     * @param ContainerBuilder $container
     */
    public function process(ContainerBuilder $container)
    {
        if (!$container->has('octave.cms.block.manager')) {
            return;
        }

        $definition = $container->findDefinition('octave.cms.block.manager');
        $taggedServices = $container->findTaggedServiceIds('octave.block.type');

        foreach ($taggedServices as $id => $tags) {
            $definition->addMethodCall('addBlock', array(new Reference($id)));
        }
    }
}