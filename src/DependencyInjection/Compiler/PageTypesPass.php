<?php

namespace VideInfra\CMSBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageTypesPass implements CompilerPassInterface
{
    /**
     * @param ContainerBuilder $container
     */
    public function process(ContainerBuilder $container)
    {
        if (!$container->has('vig.cms.page.manager')) {
            return;
        }

        $definition = $container->findDefinition('vig.cms.page.manager');
        $taggedServices = $container->findTaggedServiceIds('vig.page.type');

        foreach ($taggedServices as $id => $tags) {
            $definition->addMethodCall('addType', array(new Reference($id)));
        }
    }
}